const axios = require("axios");
const { getUser, getPlaylists, getTrackURI, getTokenInfo } = require("../service/spotifyService.js");
const { getAuthHeaders } = require("../util/auth.js");

// Mock getAuthHeaders()
jest.mock("../util/auth.js", () => ({
    getAuthHeaders: jest.fn(() => ({ Authorization: `Bearer accessToken` }))
}));

// Mock axios library
jest.mock("axios");

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
    });
});