import {Statuses} from '../types';

export interface Post {
  id: string;
  slug: string;
  status: Statuses;
  title: string;
  description: string;
  created: string;
  updated: string;
  thumbnail: string;
  content: string;
  author: string;
}
