const axios = require("axios");
const { getUser, getTokenInfo, refreshToken, getPlaylists, createPlaylist,  getTrackURI, addTracksToPlaylist} = require("../service/spotifyService.js");
const { getAuthHeaders } = require("../util/auth.js");

// Mock getAuthHeaders()
jest.mock("../util/auth.js", () => ({
    getAuthHeaders: jest.fn(() => ({ Authorization: `Bearer accessToken` }))
}));

// Mock axios library
jest.mock("axios");
//ellie working on happy path cases

describe("Spotify service layer", () => {
    describe("getUser function", () => {
        test("Successfully returns user information", async () => {
            // Arrange
            const mockUser = { id: "id", displayName: "displayName" };
            axios.get.mockResolvedValueOnce({ data: mockUser });

            // Act
            const result = await getUser();

            // Assert
            expect(result).toBe(mockUser);
        });

        test("returns nulls when error occurs", async()=>{
            axios.get.mockRejectedValue(new Error("error"));

            const result = await getUser();

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(new Error("error"))
        });


    });

    describe("getTokenInfo()",()=>{
        test("should return null with invalid input params", async()=>{
            axios.get.mockResolvedValue(null);

            const result = await getTokenInfo(null);

            expect(result).toBeNull();
        });
    })

    describe("refreshToken()",()=>{
        test("should return null with invalid input params", async()=>{
            axios.get.mockResolvedValue(null);

            const result = await refreshToken(null);

            expect(result).toBeNull();
        });
    })

    describe("getPlaylists()",()=>{
        test("should return null with invalid input params", async()=>{
            axios.get.mockResolvedValue(null);

            const result = await getPlaylists(null);

            expect(axios.get).toThrowError();
            expect(result).toBeNull();
        });
    })
});