import {Statuses} from '../types';

export interface Page {
  id: string;
  slug: string;
  status: Statuses;
  title: string;
  description: string;
  created: string;
  updated: string;
  cover: string;
  content: string;
}
