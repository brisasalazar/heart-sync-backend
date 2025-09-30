# HeartSync Backend 
A playlist-building platform. HeartSync is an application which users may utilize in order to create customized playlists for cardiovascular activity based on their statistics and personal preference. Users can create an account, upload workout stats, and receive playlists centered around their average cadence/heart rate, distance travelled, and time.
 
This repository handles the backend logic of HeartSync.

## Getting Started

To use this project yourself:

1. In the directory where you want the application stored on your computer, clone this repository. In your terminal, enter these commands:

```
git clone https://github.com/brisasalazar/heart-sync-backend.git
cd heart-sync-backend
```

2. In order to run this application, you will need to have your own API credentials from Spotify and LastFM. Instructions for each can be found here:

* <a href="https://developer.spotify.com/documentation/web-api/tutorials/getting-started">Spotify</a>
* <a href="https://www.last.fm/api#getting-started">LastFM</a>

3. Once you have the required credentials, create a `.env` file in the root of the directory. Add the following variables with your personal credentials:

```
PORT=<port>

CLIENT_ID=<client_id>
CLIENT_SECRET=<client_secret>
REDIRECT_URI=<redirect_uri>

AUTH_URL=<https://accounts.spotify.com/authorize
TOKEN_URL=https://accounts.spotify.com/api/token
API_BASE_URL=https://api.spotify.com/v1/

LASTFM_API_KEY=<lastfm_api_key>
LASTFM_API_SHARED_SECRET=<lastfm_api_shared_secret>
LASTFM_API_BASE_URL=http://ws.audioscrobbler.com/2.0
```

4. Next, you will need to install the required dependencies. Use the following command in your terminal:

```
npm i
```

5. Run the backend! In your terminal, use the following command:

```
npm run dev
```