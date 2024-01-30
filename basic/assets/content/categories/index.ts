import {Statuses} from '../types';

export interface Category {
  id: string;
  slug: string;
  status: Statuses;
  title: string;
  description: string;
  created: string;
  thumbnail: string;
}
