import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SignalRService } from '../../services/signalr.service';
import { VotingDialog } from '../votingDialog/votingDialog';

@Component({
  selector: 'game',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: 'game.component.html',
})
export class Game {
  router = inject(Router);

  role = signal<string>('');
  urlImage = signal<string>('https://i.ytimg.com/vi/xx4f21XaIA8/maxresdefault.jpg');
  gameItemClue = signal<string>('');

  code = signal<string>('');
  noAdmin = signal<boolean>(false);
  selectedNumberImpostors = signal<number>(0);
  selectedCategory = signal<string>('');
  virtualVoting = signal<boolean>(false);
  clue = signal<boolean>(false);

  name = signal<string>('');
  players = signal<{ name: string; isAdmin: boolean; state: boolean, isImpostor: boolean, role: string, urlImage: string }[]>([]);

  constructor(
    private signalRService: SignalRService,
    private dialog: MatDialog,
  ) {}

  async ngOnInit() {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;

    this.code.set(queryParams["code"]);
    this.name.set(queryParams["name"]);
    
    await this.signalRService.reconnect(queryParams["code"], queryParams["name"]);

    this.signalRService.onReceivePlayers((players) => {
      this.players.set(players);
      const thisPlayer = players.find((player) => player.name == queryParams["name"]);
      if (thisPlayer) {
        this.role.set(thisPlayer.role);
        this.noAdmin.set(!thisPlayer.isAdmin);
        if (thisPlayer.isImpostor) {
          this.urlImage.set('https://i.ytimg.com/vi/xx4f21XaIA8/maxresdefault.jpg');
          console.log(thisPlayer.urlImage);
          this.gameItemClue.set(thisPlayer.urlImage);
        } else {
          console.log(thisPlayer.urlImage);
          this.urlImage.set(thisPlayer.urlImage);
        }
      }
    });

    this.signalRService.onReceiveConfiguration((config, value) => {
      if (config == 'numberImpostors') {
        this.selectedNumberImpostors.set(Number(value));
      } else if (config == 'category') {
        this.selectedCategory.set(String(value));
      } else if (config == 'virtualVoting') {
        this.virtualVoting.set(Boolean(value));
      } else if (config == 'clue') {
        this.clue.set(Boolean(value));
      }
    });

    this.signalRService.onGameStarted((role, urlImageOrClue) => {
      if (role) {
        this.role.set(role);
        if (role != 'Impostor') {
          this.urlImage.set(urlImageOrClue);
        } else {
          this.urlImage.set('https://i.ytimg.com/vi/xx4f21XaIA8/maxresdefault.jpg');
          this.gameItemClue.set(urlImageOrClue);
        }
      } else {
        alert('Ups algo ha salido mal.');
        this.router.navigate(['/']);
      }
    });

    this.signalRService.onGameEnded((code) => {
      if (code == this.code()) {
        this.router.navigate(['/hall'], { queryParams: { code: queryParams["code"], name: queryParams["name"] }});
      }
    });

    this.signalRService.onInitVoting(() => {
      this.joinRoom();
    });

    this.signalRService.onVotingResult((result) => {
      alert(result);
    })

    this.signalRService.onUpdatePlayers(queryParams["code"], queryParams["name"]);
    this.signalRService.onChargeConfiguration(queryParams["code"], queryParams["name"]);
  }

  startGame() {
    console.log(this.code());
    console.log(this.selectedNumberImpostors());
    console.log(this.selectedCategory());
    this.signalRService.startGame(
      this.code(),
      this.selectedNumberImpostors(),
      this.selectedCategory(),
    );
  }

  goToHall() {
    this.signalRService.goToHall(this.code());
  }

  vote() {
    this.signalRService.onVote(this.code());
  }

  joinRoom() {
    this.dialog.open(VotingDialog, {
      width: '400px',
      data: {
        players: this.players(),
        code: this.code(),
        name: this.name(),
      },
    });
  }
}
