const axios = require("axios");
const { getUser, getPlaylists, getTrackURI, getTokenInfo, refreshToken, addTracksToPlaylist } = require("../service/spotifyService.js");
const { getAuthHeaders } = require("../util/auth.js");
const { logger } = require("../util/logger.js")

// Mock getAuthHeaders()
jest.mock("../util/auth.js", () => ({
    getAuthHeaders: jest.fn(() => ({ Authorization: `Bearer accessToken` }))
}));

// Mock axios library
jest.mock("axios");

// Mock logger
jest.mock("../util/logger.js")

describe("Spotify service layer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getUser function", () => {
        test("Successfully returns user information", async () => {
            // Arrange
            const mockUser = { id: "id", displayName: "displayName" };
            axios.get.mockResolvedValueOnce({ data: mockUser });

            // Act
            const result = await getUser();

            // Assert
            expect(result).toBe(mockUser);

            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(getAuthHeaders).toHaveBeenCalledTimes(1);
        });

        test("returns nulls when error occurs", async () => {
            axios.get.mockRejectedValue(new Error("error"));

            const result = await getUser();

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(new Error("error"))
        });
    });

    describe("getPlaylists function", () => {
        test("Successfully returns all current user's playlists", async () => {
            // Arrange
            const mockPlaylists = {
                items: [
                    {
                        id: "playlistId 1",
                        public: true,
                        collaborative: false,
                        name: "Playlist 1"
                    },
                    {
                        id: "playlistId 2",
                        public: false,
                        collaborative: true,
                        name: "Playlist 2"
                    }
                ]
            }
            axios.get.mockResolvedValueOnce({ data: mockPlaylists });

            // Act
            const result = await getPlaylists();

            // Assert
            expect(result).toBe(mockPlaylists);
            expect(result.items).toHaveLength(2);

            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(getAuthHeaders).toHaveBeenCalledTimes(1);
        });

        test("should throw error if axios fails", async () => {
            axios.get.mockRejectedValue(new Error("error"));

            const result = await getUser();

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(new Error("error"))
        });
    });

    describe("getTrackURI function", () => {
        test("Successfully returns a Spotify URI given a track and artist", async () => {
            // Arrange
            const mockArtist = "artist";
            const mockTrack = "track";
            const mockSpotifyURI = "spotifyId";

            axios.get.mockResolvedValueOnce({
                data: {
                    tracks: {
                        items: [
                            { uri: mockSpotifyURI }
                        ]
                    }
                }
            });

            // Act
            const result = await getTrackURI(mockArtist, mockTrack);

            // Assert
            expect(result).toBe(mockSpotifyURI);

            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(getAuthHeaders).toHaveBeenCalledTimes(1);
        });

        test("should return null when no tracks returned", async () => {
            // Brisa will finish this up 
        });

        test("should throw error and return null when axios fails", async () => {
            // brisa will finsih this up
        });
    });

    describe("getTokenInfo function", () => {
        test("Successfully returns session token info", async () => {
            // Arrange
            const mockCode = "code";
            const mockTokenInfo = {
                accessToken: "accessToken",
                refreshToken: "refreshToken",
                expiresIn: "expiresIn"
            }

            axios.post.mockResolvedValueOnce({
                data: mockTokenInfo
            });

            // Act
            const result = await getTokenInfo(mockCode);

            // Assert
            expect(result).toBe(mockTokenInfo);
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        test("should return null with invalid input params", async () => {
            axios.get.mockResolvedValue(null);

            const result = await getTokenInfo(null);

            expect(result).toBeNull();
        });
    });

    describe("refreshToken()", () => {
        test("should return null with invalid input params", async () => {
            axios.get.mockResolvedValue(null);

            const result = await refreshToken(null);

            expect(result).toBeNull();
        });
    });

    describe("addTracksToPlaylist function", () => {
        test("Successfully returns a list of Spotify URIs", async () => {
            // Arrange
            const mockPlaylistId = "playlistId";
            const mockTrackURIs = [
                "spotifyURI 1",
                "spotifyURI 2"
            ];

            axios.post.mockResolvedValueOnce({
                data: mockTrackURIs
            });

            // Act
            const result = await addTracksToPlaylist(mockPlaylistId, mockTrackURIs);

            // Assert
            expect(result).toBe(mockTrackURIs);
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        test("Successfully returns an empty list when Spotify URI list is empty", async () => {
            // Arrange
            const mockPlaylistId = "playlistId";
            const mockTrackURIs = [];

            axios.post.mockResolvedValueOnce({
                data: mockTrackURIs
            });

            // Act
            const result = await addTracksToPlaylist(mockPlaylistId, mockTrackURIs);

            // Assert
            expect(result).toBe(mockTrackURIs);
            expect(result).toHaveLength(0);

            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(logger.error).not.toHaveBeenCalled();
        });

        test("Returns null when playlist ID is not provided", async () => {
            // Working on this after lunch
        });

        test("Returns null when authorization token is expired", async () => {
            // Arrange
            const mockPlaylistId = "playlistId";
            const mockTrackURIs = [
                "spotifyURI 1",
                "spotifyURI 2"
            ];

            axios.post.mockRejectedValueOnce({
                response: {
                    status: 401,
                    data: {
                        error: "Expired token."
                    }
                }
            });

            // Act
            const result = await addTracksToPlaylist(mockPlaylistId, mockTrackURIs);

            // Assert
            expect(result).toBeNull();

            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledTimes(1);
        });
    });
});