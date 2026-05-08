import type { Itinerary } from './types';

export const ITINERARIES: Record<string, Itinerary[]> = {
  'boston': [
    {
      name: 'Weekend in Boston',
      description: 'Two days hitting the highlights -- iconic food, beautiful walks, and the best views.',
      days: [
        {
          title: 'Day 1: The classics',
          stops: [
            { entryId: 'boston-2', note: 'Start with coffee and a pastry' },
            { entryId: 'entry-1778089520301-n580e', note: 'Walk the Freedom Trail through downtown' },
            { entryId: 'boston-6', note: 'Cannoli stop in the North End' },
            { entryId: 'boston-1', note: 'Lunch -- get the hot buttered lobster roll' },
            { entryId: 'boston-4', note: 'Afternoon stroll through the Public Garden' },
            { entryId: 'entry-1777931606238-nbaos', note: 'Walk through Boston Common' },
            { entryId: 'entry-1777942067775-flpu7', note: 'Sunset views from View Boston' },
            { entryId: 'entry-1777945495228-vam3s', note: 'Dinner -- incredible omakase' },
          ],
        },
        {
          title: 'Day 2: Culture and hidden gems',
          stops: [
            { entryId: 'entry-1778097724016-x1egv', note: 'Breakfast at Flour' },
            { entryId: 'boston-5', note: 'Morning at the Gardner Museum' },
            { entryId: 'entry-1777939498372-5ppp9', note: 'Walk along the Charles River' },
            { entryId: 'entry-1777943971670-lagaj', note: 'Lunch -- spicy Yunnan noodles' },
            { entryId: 'entry-1777951169834-qs0o9', note: 'Afternoon at the Boston Public Library' },
            { entryId: 'entry-1777946765394-juyv2', note: 'Walk down Commonwealth Ave Mall' },
            { entryId: 'entry-1777935560768-yb1i3', note: 'Detour to Beacon Hill for Acorn Street' },
            { entryId: 'entry-1778098969685-jb3s1', note: 'Dinner at Cicada' },
          ],
        },
      ],
    },
  ],
  'bay-area': [],
};
