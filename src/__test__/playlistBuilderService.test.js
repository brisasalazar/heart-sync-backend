const { getTracksByGenre, getTracksByArtist } = require("../service/lastFMService");
const { populatePlaylist } = require("../service/playlistBuilderService");
const { getTrackURI, addTracksToPlaylist } = require("../service/spotifyService");

jest.mock("../service/lastFMService.js", () => ({
    getTracksByGenre: jest.fn(() =>
        Array.from({ length: 50 }, (_, i) => ({
            name: `Genre Song ${i + 1}`,
            artist: { name: `Genre Artist ${i + 1}` },
        }))
    ),
    getTracksByArtist: jest.fn(() =>
        Array.from({ length: 50 }, (_, i) => ({
            name: `Artist Song ${i + 1}`,
            artist: { name: `Artist Artist ${i + 1}` },
        }))
    ),
}));

jest.mock("../service/spotifyService.js", () => ({
    getTrackURI: jest.fn(() => "SpotifyURI"),
    addTracksToPlaylist: jest.fn(() => "playlistId")
}));

describe("Playlist Builder service layer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Successfully returns a list of 100 Spotify URIs", async () => {
        // Arrange
        // Act
        const spotifyURIs = await populatePlaylist("playlistId", "genre", "artistName");

        // Assert
        expect(spotifyURIs).toHaveLength(100);

        expect(getTracksByGenre).toHaveBeenCalledTimes(1);
        expect(getTracksByArtist).toHaveBeenCalledTimes(1);
        expect(getTrackURI).toHaveBeenCalledTimes(100);
        expect(addTracksToPlaylist).toHaveBeenCalledTimes(1);
        expect(addTracksToPlaylist).toHaveBeenCalledWith(
            "playlistId",
            expect.arrayContaining(Array(100).fill("SpotifyURI"))
        );
    });

    test("Successfully returns a list of 50 Spotify URIs based on genre", async () => {
        // Arrange
        // Act
        const spotifyURIs = await populatePlaylist("playlistId", "genre");

        // Assert
        expect(spotifyURIs).toHaveLength(50);

        expect(getTracksByGenre).toHaveBeenCalledTimes(1);
        expect(getTracksByArtist).toHaveBeenCalledTimes(0);
        expect(getTrackURI).toHaveBeenCalledTimes(50);
        expect(addTracksToPlaylist).toHaveBeenCalledTimes(1);
        expect(addTracksToPlaylist).toHaveBeenCalledWith(
            "playlistId",
            expect.arrayContaining(Array(50).fill("SpotifyURI"))
        );
    });

    test("Successfully returns a list of 50 Spotify URIs based on artist", async () => {
        // Arrange
        // Act
        const spotifyURIs = await populatePlaylist("playlistId", null, "artist");

        // Assert
        expect(spotifyURIs).toHaveLength(50);

        expect(getTracksByGenre).toHaveBeenCalledTimes(0);
        expect(getTracksByArtist).toHaveBeenCalledTimes(1);
        expect(getTrackURI).toHaveBeenCalledTimes(50);
        expect(addTracksToPlaylist).toHaveBeenCalledTimes(1);
        expect(addTracksToPlaylist).toHaveBeenCalledWith(
            "playlistId",
            expect.arrayContaining(Array(50).fill("SpotifyURI"))
        );
    });

    test("Successfully returns an empty list of Spotify URIs when no genre/artist is given", async () => {
        // Arrange
        // Act
        const spotifyURIs = await populatePlaylist("playlistId");

        // Assert
        expect(spotifyURIs).toHaveLength(0);

        expect(getTracksByGenre).toHaveBeenCalledTimes(0);
        expect(getTracksByArtist).toHaveBeenCalledTimes(0);
        expect(getTrackURI).toHaveBeenCalledTimes(0);
        expect(addTracksToPlaylist).toHaveBeenCalledTimes(1);
        expect(addTracksToPlaylist).toHaveBeenCalledWith(
            "playlistId",
            expect.arrayContaining(Array(0).fill("SpotifyURI"))
        );
    });
});