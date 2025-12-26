import { Routes } from '@angular/router';
import { Start } from './shared/home/start';
import { Locations } from './characters/pages/locations/locations';
import { Episode } from './characters/pages/episode/episode';
import { CharacterDetails } from './characters/pages/onecharacterdetails/character-details';
import { CharactersList } from './characters/pages/characters/characters';
import { NotFound } from './characters/pages/not-found/not-found';


export const routes: Routes = [

  {
    path:'',
    component: Start,

  },
  {
    path: 'Home',
    children: [{

                path: 'characters',
                children: [
                    {
                      path: '',
                      component: CharactersList
                    },
                    {
                      path: ':id',
                      component: CharacterDetails
                    },
                  ],
          },
          {
            path: 'episode',
            component: Episode
          },
          {
            path: 'locations',
            component: Locations
          },


          { path: '404',
            component: NotFound },
          {
            path: '**',
            redirectTo: '404',
          },

        ]
      },

  { path: '404',
    component: NotFound },
  {
    path: '**',
     redirectTo: '404',
  },


];


