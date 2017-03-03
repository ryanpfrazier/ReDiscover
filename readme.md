#ReDiscover
An intuitive playlist generator utilizing listening history from Spotify, also featuring customizable inputs to create personalized playlists directly to the user's Spotify account.

Check out a walkthrough of our app here: *Coming soon*

Our current deployed version is here: http://ryanpfrazier-rediscover.herokuapp.com/

###Features
1. The **sign in page** gives a brief description of the app and signs the user in via Spotify's OAuth protocol.

2. After signing in, the user lands at the **home page**, which gives a brief description of the app.

3. Upon clicking the "Try it out!" button, the user is taken to the **default page**, which allows the user to name the playlist, pick a time frame from which to analyze listening history, and set a total song count for the playlist.

4. The user generates a playlist with the "ReDiscover!" button, redirecting to the **web player page**, which renders an embedded Spotify playlist that the user can listen to directly in the app.

5. By going to the **custom page**, the user can again name the playlist and set the number of songs, but also decide which artists to use for the analysis, as well as additional playlist inputs: happiness, energy and danceability. Finally, the user will generate a new playlist by navigating back to the **web player page** with the "ReDiscover!" button.

6. Playlists are automatically saved to the user's linked Spotify account in their library, as a private playlist that they can listen to in the future.

###Technologies Used
1. **Spotify API**: used to get user info, recommend songs, and build and save playlists in the user's linked account.

2. This app uses **Bootstrap** as a framework and **Heroku** for deployment.
