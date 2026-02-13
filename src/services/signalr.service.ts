import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  startConnection() {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/gamehub`)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Conexión iniciada'))
      .catch((err) => console.error('Error al conectar: ', err));
  }

  // CONTROL DE CONEXIÓN

  async reconnect(code: string, name: string) {
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      await this.hubConnection.start();
    }

    let retries = 0;
    while (this.hubConnection.state !== signalR.HubConnectionState.Connected && retries < 10) {
      await new Promise((res) => setTimeout(res, 200));
      retries++;
    }

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('Reconnect', code, name);
    } else {
      console.error('No se pudo reconectar: estado actual', this.hubConnection.state);
    }
  }

  onError(callback: (error: string) => void) {
    this.hubConnection.on('Error', callback);
  }

  isConnected() {
    return this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected;
  }

  // CONTROL DE SALAS

  onCreateRoom(name: string) {
    this.hubConnection.invoke('CreateRoom', name);
  }

  onEnterRoom(callback: (code: string) => void) {
    this.hubConnection.on('EnterRoom', callback);
  }

  onJoinRoom(code: string, name: string) {
    this.hubConnection.invoke('JoinRoom', code, name);
  }

  onLeaveRoom(code: string, name: string) {
    this.hubConnection.invoke('LeaveRoom', code, name);
  }

  onGoHome(callback: () => void) {
    this.hubConnection.on('GoHome', callback);
  }

  // CONTROL DE JUEGO

  startGame(code: string, numberImpostors: number, category: string) {
    this.hubConnection.invoke('StartGame', code, numberImpostors, category);
  }

  goToHall(code: string) {
    this.hubConnection.invoke('GoToHall', code);
  }

  onGameStarted(callback: (role: string, urlImage: string) => void) {
    this.hubConnection.on('RoleAssigned', callback);
  }

  onGameEnded(callback: (code: string) => void) {
    this.hubConnection.on('GameEnded', callback);
  }

  onUpdatePlayers(code: string, name?: string) {
    this.hubConnection.invoke('UpdatePlayers', code, name);
  }

  onReceivePlayers(
    callback: (
      players: {
        name: string;
        isAdmin: boolean;
        state: boolean;
        isImpostor: boolean;
        role: string;
        urlImage: string;
      }[],
    ) => void,
  ) {
    this.hubConnection.on('ReceivePlayers', callback);
  }

  onVote(code: string) {
    this.hubConnection.invoke('Vote', code);
  }

  onInitVoting(callback: () => void) {
    this.hubConnection.on('InitVoting', callback);
  }

  onVotePlayer(code: string, playerVotedName: string, name: string) {
    console.log(playerVotedName, code, name);
    this.hubConnection.invoke('VotePlayer', playerVotedName, code, name);
  }

  onVotingResult(callback: (result: string) => void) {
    this.hubConnection.on('VotingResult', callback);
  }

  onUpdateConfiguration(code: string, config: string, value: any) {
    this.hubConnection.invoke('UpdateConfiguration', code, config, value);
  }

  onReceiveConfiguration(callback: (config: string, value: string | boolean | number) => void) {
    this.hubConnection.on('ReceiveConfiguration', callback);
  }

  onChargeConfiguration(code: string, name?: string) {
    this.hubConnection.invoke('ChargeConfiguration', code, name);
  }
}
