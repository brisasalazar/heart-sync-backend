const { getTracksByGenre, getTracksByArtist } = require("../service/lastFMService.js");

global.fetch = jest.fn();

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
    describe("getTracksByGenre function", () => {
        test("Successfully returns a list of 50 tracks by genre", async () => {
            // Arrange
            const mockTracks = createMockTracksByGenre();

            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({ tracks: { track: mockTracks } })
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
                invalidKey: "Invalid value"
            };

            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve(mockTracks)
            });

            // Act
            const result = await getTracksByGenre("genre");

            // Assert
            expect(result).toBe(null);
        });
    });

    describe("getTracksByArtist function", () => {
        test("Successfully returns a list of 50 tracks by artist", async () => {
            // Arrange
            const mockTracks = createMockTracksByArtist();

            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({ toptracks: { track: mockTracks } })
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
                invalidKey: "Invalid value"
            };

            fetch.mockResolvedValueOnce({
                json: () => Promise.resolve(mockTracks)
            });

            // Act
            const result = await getTracksByArtist("artist");

            // Assert
            expect(result).toBe(null);
        });
    });
});