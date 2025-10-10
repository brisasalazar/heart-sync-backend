const axios = require("axios");
const { getTracksByGenre, getTracksByArtist } = require("../service/lastFMService");
const { populatePlaylist } = require("../service/playlistBuilderService");
const { getTrackURI, addTracksToPlaylist } = require("../service/spotifyService");
const { logger } = require("../util/logger.js");

jest.mock("axios");

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

jest.mock("../util/logger.js");

describe("Playlist Builder service layer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("populatePlaylist function", () => {
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

        test("Returns null when playlist ID is not provided", async () => {
            // Arrange
            // Act
            const spotifyURIs = await populatePlaylist("", "genre", "artistName");

            // Assert
            expect(spotifyURIs).toBeNull();

            expect(addTracksToPlaylist).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledTimes(1);
        });

        test("Returns null when authorization token is invalid", async () => {
            // Arrange
            getTrackURI.mockRejectedValueOnce({
                response: {
                    status: 401,
                    data: {
                        error: "Invalid token."
                    }
                }
            })

            // Act
            const spotifyURIs = await populatePlaylist("playlistId", "genre", "artistName");

            // Assert
            expect(spotifyURIs).toBeNull();

            expect(getTrackURI).toHaveBeenCalledTimes(1);
            expect(addTracksToPlaylist).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledTimes(1);
        });
    });
});