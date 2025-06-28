export type Preferences = {
  country: string | null;
  continent: string | null;
  destination: string | null;
};

export type PreferencesResponse = {
  type: "preferences";
  preferences: Preferences;
};

export type CompletionResponse = {
  type: "response.completed";
  responseId: string;
};

export type StreamEvent = string | PreferencesResponse | CompletionResponse;
