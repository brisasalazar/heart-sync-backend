const axios = require("axios");
const { getUser, getPlaylists } = require("../service/spotifyService.js");
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
});