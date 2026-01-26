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

  onHallConnect(code: string, playerName: string) {
    this.hubConnection.invoke('JoinGame', code, playerName);
  }

  onPlayerJoined(callback: (playerName: string) => void) {
    this.hubConnection.on('PlayerJoined', callback);
  }

  onPlayerLeft(callback: (playerName: string) => void) {
    this.hubConnection.on('PlayerLeft', callback);
  }

  startGame(code: string, numberImpostors: number, category: string) {
    console.log(code, numberImpostors, category);
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

  updatePlayers(code: string) {
    this.hubConnection.invoke('UpdatePlayers', code);
  }

  onUpdatePlayers(callback: (players: string[]) => void) {
    this.hubConnection.on('UpdatePlayers', callback);
  }
}
