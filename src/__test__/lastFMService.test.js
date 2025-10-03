const axios = require("axios");
const { getTracksByGenre, getTracksByArtist } = require("../service/lastFMService.js");
const { logger } = require("../util/logger.js");

jest.mock("axios");

jest.mock("../util/logger.js");

const createMockTracksByGenre = () =>
    Array.from({ length: 50 }, (_, i) => ({
        name: `Genre Song ${i + 1}`,
        duration: `${i + 1}`,
        artist: { name: `Genre Artist ${i + 1}` },
    }));

const createMockTracksByArtist = () =>
    Array.from({ length: 50 }, (_, i) => ({
        name: `Artist Song ${i + 1}`,
        artist: { name: `Artist Artist ${i + 1}`, }
    }));

describe("LastFM service layer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getTracksByGenre function", () => {
        test("Successfully returns a list of 50 tracks by genre", async () => {
            // Arrange
            const mockTracks = createMockTracksByGenre();

            axios.get.mockResolvedValueOnce({
                data: { tracks: { track: mockTracks } }
            });

            // Act
            const result = await getTracksByGenre("genre");

            // Assert
            expect(result).toHaveLength(50);

            expect(result[0]).toHaveProperty("name", "Genre Song 1");
            expect(result[0]).toHaveProperty("artist.name", "Genre Artist 1");
            expect(result[0]).toHaveProperty("duration", "1");

            expect(result[49]["name"]).toBe("Genre Song 50");
            expect(result[49]["artist"].name).toBe("Genre Artist 50");
            expect(result[49]["duration"]).toBe("50");
        });

        test("Handles invalid response shape", async () => {
            // Arrange
            const mockTracks = {
                invalidKey: {}
            };

            axios.get.mockResolvedValueOnce({
                data: { mockTracks }
            });

            // Act
            const result = await getTracksByGenre("genre");

            // Assert
            expect(result).toBeNull();
            expect(logger.error).not.toHaveBeenCalled();
        });

        test("Handles API client error response", async () => {
            // Arrange
            axios.get.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {
                        error: "Client error."
                    }
                }
            });

            // Act
            const result = await getTracksByGenre("genre");

            // Assert
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledTimes(1);
        });
    });

    describe("getTracksByArtist function", () => {
        test("Successfully returns a list of 50 tracks by artist", async () => {
            // Arrange
            const mockTracks = createMockTracksByArtist();

            axios.get.mockResolvedValueOnce({
                data: { toptracks: { track: mockTracks } }
            });

            // Act
            const result = await getTracksByArtist("artist");

            // Assert
            expect(result).toHaveLength(50);

            expect(result[0]).toHaveProperty("name", "Artist Song 1");
            expect(result[0]).toHaveProperty("artist.name", "Artist Artist 1");

            expect(result[49]["name"]).toBe("Artist Song 50");
            expect(result[49]["artist"].name).toBe("Artist Artist 50");
        });

        test("Handles invalid response shape", async () => {
            // Arrange
            const mockTracks = {
                invalidKey: {}
            };

            axios.get.mockResolvedValueOnce({
                data: { mockTracks }
            });

            // Act
            const result = await getTracksByArtist("artist");

            // Assert
            expect(result).toBeNull();
            expect(logger.error).not.toHaveBeenCalled();
        });

        test("Handles API client error response", async () => {
            // Arrange
            axios.get.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {
                        error: "Client error."
                    }
                }
            });

            // Act
            const result = await getTracksByArtist("genre");

            // Assert
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledTimes(1);
        });
    });
});