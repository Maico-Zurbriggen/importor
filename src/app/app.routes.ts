import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'home',
        loadComponent: () => import('./home/home').then((mod) => mod.Home),
    },
    {
        path: 'hall',
        loadComponent: () => import('./hall/hall').then((mod) => mod.Hall),
    },
    {
        path: 'game',
        loadComponent: () => import('./game/game').then((mod) => mod.Game),
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
