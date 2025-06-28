# My Submission

In the interests of time, I have not implemented a production ready solution, but something that hopefully showcases my skills & ways of working. I have noted below further improvements that I would look to make if this solution was to be production ready.

## Running this repo

I have added a new `.env` variable, in order for this to run as expected, you will need to make sure to provide the `OPENAI_PROMPT_INSTRUCTION` environment variable as set in the `.env.example` file.

## Further Improvements

With additional time, for a production application, I'd make these additional improvements:

- Currently the response is in markdown format, but the chatbot only displays plain text. Either improve the chat UI to display markdown or force the AI to return only plain text responses
- The app does not store any data or session information, so the preference information is only stored for as long as the browser window exists. In practice, this should probably be stored in both a cache & a more permanent data store.
- The OpenAI implementation is somewhat tangled with the `chatService`. It would be better to have a clean `IChatService` that didn't contain any OpenAI specific implementation so that multiple LLMs can be used in tandem or switched out.
- The `preference` & `lastResponseId` are passed back up to the front-end using events that refer somewhat to the underlying implementation. It would be better to have some kind of React context or state that these were contained within to make it easier to send back & forth as well as to display in the UI.
- There is little logging/analytics/user feedback for things that could go wrong. This should be expanded upon.
- When the page loads, currently we send in the location of Ask Vinny HQ. This should be updated in a production application to geolocate the user using a geolocation API, passing in the IP address from the `x-forwarded-for` header to locate the user. This was not possible (easily) running locally as my IP was localhost.
- The UI has been relatively untouched, but it would be good to show user feedback for failed requests as well as a loading state (I like to use skeletons).
- It could be possible for the user to type multiple messages or not receive a response. It would be better if we stored both the last response & last request & used this to more intelligently prompt the AI in cases like this.
- There are no unit or integration tests
