export type Place = {
  styles: string[],
  location: Location[],
  features: Feature[],
  weather: Weather | undefined,
}

type Location = {
  type: string, // 'city', 'town', ...
  value: string
}

type Feature = {
  distance: number, // distance to the chosen point
  type: string, // church, hotel, ...
  name: string | undefined, // name, if it has one
}

type Weather = {
  summary: string, // 'Partly Cloudy', ...
  season: string, // 'Autumn', ...
}
