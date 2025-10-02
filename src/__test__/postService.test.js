// Test Suite for Post Service Layer 

const postRepository = require("../repository/postRepository.js");
const userService = require("../service/userService.js");
const postService = require("../service/postService.js");
//const {logger} = require("../util/logger.js");

// mock dependencies 
jest.mock("../repository/postRepository.js");
jest.mock("../service/userService.js");
//jest.mock("../util/logger.js")

describe("Post Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getPostsFromUser()", () => {
        test("should return posts when userID exists", async () => {
            const mockPosts = {
                Items: [
                    { PK: "USER#123", SK: "POST#1", username: "testuser", pst_caption: "Test post" }
                ]
            };
            postRepository.getPostsFromUser.mockResolvedValue(mockPosts);

            const result = await postService.getPostsFromUser("123");

            expect(result).toEqual(mockPosts);
        });

        test("should return null when userID doesn't exist", async () => {
            postRepository.getPostsFromUser.mockResolvedValue(null);

            const result = await postService.getPostsFromUser("fakeUser");

            expect(result).toBeNull();
        });

        test("should return null when userID is empty", async () => {
            postRepository.getPostsFromUser.mockResolvedValue(undefined);

            const result = await postService.getPostsFromUser();

            expect(result).toBeNull();
        });
    });

    describe("createPost()", () => {
        const mockUser = { PK: "USER#123", username: "someUser" };
        const validPostInfo = {
            playlist_spotifyURI: "http://fakeplaylist.com",
            pst_activityType: "run",
            pst_caption: "i did this",
            pst_media: "photoLink"
        };

        test("should create post successfully with valid data", async () => {
            const mockCreatedPost = { PK: "USER#123", SK: "POST#456" };
            userService.getUserByUsername.mockResolvedValue(mockUser);
            postRepository.putPost.mockResolvedValue(mockCreatedPost);

            const result = await postService.createPost("someUser", validPostInfo);

            expect(postRepository.putPost).toHaveBeenCalledWith(
                expect.objectContaining({
                    PK: "USER#123",
                    username: "someUser",
                    playlist_spotifyURI: "http://fakeplaylist.com",
                    pst_activityType: "run",
                    pst_caption: "i did this",
                    pst_media: "photoLink"
                })
            );
            expect(result).toEqual(mockCreatedPost);
        });

        test("should return null when post creation fails", async () => {
            userService.getUserByUsername.mockResolvedValue(mockUser);
            postRepository.putPost.mockResolvedValue(null);

            const result = await postService.createPost("someUser", validPostInfo);

            expect(result).toBeNull();
        });
    });

    describe("deletePost()", ()=>{
        const mockUser = { PK: "USER#123", username: "user" };
        
        test("should return null when post deletion fails", async() =>{
            userService.getUserByUsername.mockResolvedValue(mockUser)
            postRepository.deletePost.mockResolvedValue(null);

            const result = await postService.deletePost("user", "456");

            expect(result).toBeNull();
        });
        
         test("should delete post successfully with valid data", async() =>{
            const mockDeletedPost = {PK: "USER#123", SK: "POST#456"};
            userService.getUserByUsername.mockResolvedValue(mockUser);
            postRepository.deletePost.mockResolvedValue(mockDeletedPost);

            const result = await postService.deletePost(mockUser.PK, "456");

            expect(result).toEqual(mockDeletedPost);
        });
    });
});
