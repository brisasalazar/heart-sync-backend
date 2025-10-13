const axios = require("axios");
const { getUser, getPlaylists, getTrackURI, getTokenInfo, refreshToken, addTracksToPlaylist, getSpotifyPlaylistbyPlaylistId } = require("../service/spotifyService.js");
const spotifyService = require("../service/spotifyService.js");
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

// Mock Session Data
jest.mock("../session/session.js", () => ({
    accessToken: "mockedValue",
}));
const session = require("../session/session.js");

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

            const result = await getPlaylists();

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
            const mockArtist = "artist";
            const mockTrack = "track";

            axios.get.mockResolvedValueOnce({
                data: {
                    tracks: {
                        items: []
                    }
                }
            });

            const result = await getTrackURI(mockArtist, mockTrack);
            
            expect(result).toBeNull();
            expect(axios.get).toHaveBeenCalled();
        });

        test("should throw error and return null when axios fails", async () => {
            const mockArtist = "artist";
            const mockTrack = "track";

            axios.get.mockRejectedValue(new Error);

            const result = await getTrackURI(mockArtist, mockTrack);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(new Error);
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

        test("should return null and throw error with invalid input params", async () => {
            const mockCode = "code";

            axios.post.mockRejectedValue(new Error);

            const result = await getTokenInfo(mockCode);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(new Error);
        });
    });

    describe("refreshToken()", () => {
        test("should return new token data when refresh is successful", async () => {
            const mockSession = {
                refreshToken: "refreshToken"
            };
            const mockTokenInfo = {
                access_token: "accessToken",
                expires_in: 30,
                token_type: "Bearer"
            };
            axios.post.mockResolvedValue({data: mockTokenInfo});

            const result = await refreshToken(mockSession);

            expect(axios.post).toHaveBeenCalled();
            expect(result).toEqual(mockTokenInfo);
        });

        test("should return null and log error when refresh fails", async () => {
            const mockSession = {
                refreshToken: "invalid-refresh-token"
            };
            const mockError = new Error("Invalid refresh token");
            axios.post.mockRejectedValue(mockError);

            const result = await refreshToken(mockSession);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(mockError);
        });

        test("should return null and catch error when null session parameter", async () => {
            const mockError = new TypeError("Cannot read properties of null (reading 'refreshToken')");
            axios.post.mockRejectedValue(mockError);

            const result = await refreshToken(null);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(mockError);
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
            // Arrange
            const mockPlaylistId = "";
            const mockTrackURIs = [
                "spotifyURI 1",
                "spotifyURI 2"
            ];

            axios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {
                        error: "Invalid playlist ID."
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

    describe("getSpotifyPlaylistbyPlaylistId function", () => {
        test("successfully returns correct playlist", async () => {
            const dummyPlaylistId = "3cEYpjA9oz9GiPac4AsH4n";
            const mockSpotifyPlaylist = {
                description: "A playlist for testing purpose",
                id: "3cEYpjA9oz9GiPac4AsH4n",
                tracks: [
                    {
                        id: "2pANdqPvxInB0YvcDiw4ko",
                    }
                ]

            }
            axios.get.mockResolvedValueOnce({data: mockSpotifyPlaylist});

            const result = await getSpotifyPlaylistbyPlaylistId(dummyPlaylistId);

            expect(result).toBe(mockSpotifyPlaylist);
            expect(result.description).toBe("A playlist for testing purpose");
            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(getAuthHeaders).toHaveBeenCalledTimes(1);
        })

        test("inputting the wrong playlistId will return null", async () => {
            const dummyPlaylistId = "3cEYpjA9oz9GiPac4AsH4n";
            axios.get.mockResolvedValueOnce(null);

            const result = await getSpotifyPlaylistbyPlaylistId(dummyPlaylistId);
            expect(result).toBeNull();
            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledTimes(1);
        })
    });

    describe("createPlaylist function", () => {

        test("Returns valid Id if inputs are valid", async () => {
            

            const dummyUserId = "dummyId";
            const dummyName = "bikeriding playlist";
            const dummyIsPublic = false;
            const dummyIsCollaborative = false;
            const dummyDescription = "This is a test description";
            const dummyLocalUserId = "dummyLocalId";

            const mockSpotifyPlaylist = {
                description: "A playlist for testing purpose",
                id: "3cEYpjA9oz9GiPac4AsH4n",
                tracks: [
                    {
                        id: "2pANdqPvxInB0YvcDiw4ko",
                    }
                ]

            }

            axios.post.mockResolvedValueOnce({data: mockSpotifyPlaylist});
            const createdPlaylistId = await spotifyService.createPlaylist(dummyUserId, dummyName, dummyIsPublic,
                dummyIsCollaborative, dummyDescription, dummyLocalUserId);
            
            expect(createdPlaylistId).toBe(mockSpotifyPlaylist.id);
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(getAuthHeaders).toHaveBeenCalled();
            
        })
        
        test("Returns null if database creation fails", async () => {
            axios.post.mockRejectedValueOnce({  
                "error": {
                    "status": 400,
                    "message": "string"  
                }
            })

            const dummyUserId = "dummyId";
            const dummyName = "bikeriding playlist";
            const dummyIsPublic = false;
            const dummyIsCollaborative = false;
            const dummyDescription = "This is a test description";
            const dummyLocalUserId = "dummyLocalId";

            const createdPlaylistId = await spotifyService.createPlaylist(dummyUserId, dummyName, dummyIsPublic, dummyIsCollaborative, dummyDescription, dummyLocalUserId);
            expect(createdPlaylistId).toBeNull()
            expect(logger.error).toHaveBeenCalledTimes(1);
        })
        
        test("Returns null if session token is invalid", async () => {
            session.accessToken = null;

            const dummyUserId = "dummyId";
            const dummyName = "bikeriding playlist";
            const dummyIsPublic = false;
            const dummyIsCollaborative = false;
            const dummyDescription = "This is a test description";
            const dummyLocalUserId = "dummyLocalId";

            

            const createdPlaylistId = await spotifyService.createPlaylist(dummyUserId, dummyName, dummyIsPublic, dummyIsCollaborative, dummyDescription, dummyLocalUserId);
            expect(createdPlaylistId).toBeNull()
            expect(logger.error).toHaveBeenCalledTimes(1);
        })

        
    })
});