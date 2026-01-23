import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5261/gamehub')
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
    console.log(numberImpostors);
    this.hubConnection.invoke('StartGame', code, numberImpostors, category);
  }

  onGameStarted(callback: (role: string) => void) {
    this.hubConnection.on('RoleAssigned', callback);
  }
}
