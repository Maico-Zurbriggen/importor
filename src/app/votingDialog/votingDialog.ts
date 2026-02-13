import { Component, Inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogContent,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SignalRService } from '../../services/signalr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'voting-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogContent, MatIconModule],
  styleUrl: './votingDialog.css',
  template: `
    <h2 mat-dialog-title>Votar</h2>
    <mat-dialog-content>
      <section class="players-container">
        @for (player of players(); track player; let i = $index) {
          <section
            class="player-container"
            [ngClass]="'player' + (i + 1)"
            (click)="changeVotingPlayer(votingPlayer().length > 0 ? '' : player.name)"
          >
            @if (votingPlayer() != player.name) {
              <p>{{ player.name }}</p>
            } @else {
              <button
                mat-icon-button
                aria-label="Votar jugador"
                (click)="votePlayer(player.name)"
              >
                <mat-icon>check</mat-icon>
              </button>
            }
          </section>
        }
      </section>
    </mat-dialog-content>
  `,
})
export class VotingDialog {
  router = inject(Router);
  
  players = signal<{name: string, isAdmin: boolean, state: boolean}[]>([]);
  code = signal<string>('');
  name = signal<string>('');
  votingPlayer = signal<string>('');

  constructor(
    private signalRService: SignalRService,
    @Inject(MAT_DIALOG_DATA) public data: { players: {name: string, isAdmin: boolean, state: boolean}[], code: string, name: string },
    private dialogRef: MatDialogRef<VotingDialog>,
  ) {}

  ngOnInit() {
    this.players.set(this.data.players);
    this.code.set(this.data.code);
    this.name.set(this.data.name);
  }

  close() {
    this.dialogRef.close();
  }

  changeVotingPlayer(value: string) {
    this.votingPlayer.set(value);
  }

  votePlayer(playerName: string) {
    this.dialogRef.close();
    this.signalRService.onVotePlayer(this.code(), playerName, this.name());
  }
}
