import { writable } from 'svelte/store';

export interface Layout {
	order: [];
	[key: string]: string[];
}

export const homeLayout = writable({
	order: ['Events'],
	Events: ['Blackboard Menu', 'Upcoming Events', 'Latest Posts']
});
