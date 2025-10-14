// Test Suite for Post Service Layer 

const postRepository = require("../repository/postRepository.js");
const userService = require("../service/userService.js");
const postService = require("../service/postService.js");
const {logger} = require("../util/logger.js");

// mock dependencies 
jest.mock("../repository/postRepository.js");
jest.mock("../service/userService.js");
jest.mock("../util/logger.js")

const spyValidatePost = jest.spyOn(postService, "validatePost");

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

            expect(postRepository.getPostsFromUser).toHaveBeenCalled();
            expect(result).toBeNull();
        });

        test("should return null when userID is empty", async () => {
            postRepository.getPostsFromUser.mockResolvedValue(undefined);

            const result = await postService.getPostsFromUser();

            expect(postRepository.getPostsFromUser).toHaveBeenCalled();
            expect(result).toBeNull();
        });

        test("should catch error when error with database", async () => {
            postRepository.getPostsFromUser.mockRejectedValue(new Error ("error"));

            const result = await postService.getPostsFromUser();

            expect(postRepository.getPostsFromUser).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(new Error("error"));
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

        const invalidPostInfo = {
            playlist_spotifyURI: "http://fakeplaylist.com",
        };

        test("should create post successfully with valid data", async () => {
            const mockCreatedPost = { PK: "USER#123", SK: "POST#456" };

            userService.getUserById.mockResolvedValue(mockUser);
            postRepository.putPost.mockResolvedValue(mockCreatedPost);

            const result = await postService.createPost(mockUser.PK, validPostInfo);
            await postService.validatePost(validPostInfo);
            
            expect(userService.getUserById).toHaveBeenCalled();
            expect(spyValidatePost).toHaveBeenCalledTimes(1);
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
            userService.getUserById.mockResolvedValue(mockUser);
            postRepository.putPost.mockResolvedValue(null);

            const result = await postService.createPost(mockUser.PK, validPostInfo);

            expect(result).toBeNull();
            expect(userService.getUserById).toHaveBeenCalled();
        });

        test("should return null if unable to validate data", async()=>{
            userService.getUserById.mockResolvedValue(mockUser);
           
            const result = await postService.createPost(mockUser.PK, invalidPostInfo);
            await postService.validatePost(invalidPostInfo);

            expect(result).toBeNull();
            expect(userService.getUserById).toHaveBeenCalled();
            expect(spyValidatePost).toHaveBeenCalledTimes(1);
            expect(spyValidatePost).toHaveBeenCalledWith(invalidPostInfo);
            expect(logger.error).toHaveBeenCalledWith(`Missing fields.`);
        });

         test("should return null and catch error if unable to retrieve user", async()=>{
            userService.getUserById.mockRejectedValue(new Error);

            const result = await postService.createPost(mockUser.PK, invalidPostInfo);

            expect(userService.getUserById).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(new Error);
            expect(result).toBeNull();
        });
    });

    describe("deletePost()", ()=>{
        const mockUser = { PK: "USER#123", username: "user" };
        const mockPost = {PK: "USER#123", SK: "POST#456"};
        
        test("should return null when post deletion fails", async() =>{
            postRepository.getPostByID.mockResolvedValue(mockPost);
            postRepository.deletePost.mockResolvedValue(null);

            const result = await postService.deletePost(mockUser.PK, mockPost.SK);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(`Unable to delete post`, null);
            expect(postRepository.getPostByID).toHaveBeenCalled();
            expect(postRepository.deletePost).toHaveBeenCalled();
        });
        
         test("should delete post successfully with valid data", async() =>{
            const mockDeletedPost = {PK: "USER#123", SK: "POST#456"};
            postRepository.getPostByID.mockResolvedValue(mockDeletedPost);
            postRepository.deletePost.mockResolvedValue(mockDeletedPost);

            const result = await postService.deletePost(mockUser.PK, "456");

            expect(result).toEqual(mockDeletedPost);
            expect(logger.info).toHaveBeenCalledWith(`Successfully deleted post`, mockDeletedPost);
            expect(postRepository.getPostByID).toHaveBeenCalled();
            expect(postRepository.deletePost).toHaveBeenCalled();
        });

        test("should return null and throw error when fail to get post by id", async()=>{
            postRepository.getPostByID.mockRejectedValue(new Error);

            const result = await postService.deletePost(mockUser.PK, "456");

            expect(logger.error).toHaveBeenCalledWith(new Error);
            expect(result).toBeNull();
        });
    });

    describe("getUserFeed()", ()=>{
        // user serice should not return error when valid userID
        // test for when following list is empty
        const dummyFeed = [
                {
                    PK: "USER#123",
                    SK: "POST#123", 
                    username: "user2", 
                    playlist_spotifyURI: "https://fakelink.com", 
                    pst_activityType: "run", 
                    pst_caption: "hello world",
                    pst_timestamp: 3
                }, 
                {
                    PK: "USER#123",
                    SK: "POST#1897", 
                    username: "user3", 
                    playlist_spotifyURI: "https://fakelink.com", 
                    pst_activityType: "run", 
                    pst_caption: "hello world",
                    pst_timestamp: 2

                }, 
                {
                    PK: "USER#145",
                    SK: "POST#1283", 
                    username: "user3", 
                    playlist_spotifyURI: "https://fakelink.com", 
                    pst_activityType: "run", 
                    pst_caption: "hello world",
                    pst_timestamp: 1
                }
        ];

        const dummyUser = {
            username: "user",
            PK: "USER#1748",
            following: ["123", "145"]
        };

        const dummyUserPosts = [
            {
                PK: "USER#1748",
                SK: "POST#18990", 
                username: "user", 
                playlist_spotifyURI: "https://fakelink.com", 
                pst_activityType: "run", 
                pst_caption: "hello world",
                pst_timestamp: 57
            }
        ];

        const dummyUser2Posts = [
            {
                PK: "USER#123",
                SK: "POST#123", 
                username: "user2", 
                playlist_spotifyURI: "https://fakelink.com", 
                pst_activityType: "run", 
                pst_caption: "hello world",
                pst_timestamp: 3
            }
        ]

        const dummyUser3Posts = [
            {
                 PK: "USER#145",
                SK: "POST#1283", 
                username: "user3", 
                playlist_spotifyURI: "https://fakelink.com", 
                pst_activityType: "run", 
                pst_caption: "hello world",
                pst_timestamp: 1
            },
            {
                PK: "USER#123",
                SK: "POST#123", 
                username: "user2", 
                playlist_spotifyURI: "https://fakelink.com", 
                pst_activityType: "run", 
                pst_caption: "hello world",
                pst_timestamp: 3
            }
        ]

        test("should return feed when successful", async()=>{
            userService.getUserById.mockResolvedValue(dummyUser);
            postRepository.getPostsFromUser
                .mockResolvedValueOnce({ Items: dummyUser2Posts })  
                .mockResolvedValueOnce({ Items: dummyUser3Posts }); 
            
            const result = await postService.getUserFeed(dummyUser.PK);
            const expectedFeed = [...dummyUser2Posts, ...dummyUser3Posts].sort().reverse();

            expect(userService.getUserById).toHaveBeenCalledWith(dummyUser.PK);
            expect(postRepository.getPostsFromUser).toHaveBeenCalledTimes(2);
            expect(result).toEqual(expectedFeed);
        });

        test("should return null and throw error when unsuccessful", async()=>{
            userService.getUserById.mockRejectedValue(new Error("error"));

            const result = await postService.getUserFeed(dummyUser.PK);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(new Error("error"));            
        });

        test("should return null and throw TypeError when empty following list", async()=>{
            userService.getUserById.mockResolvedValue(dummyUser);
            postRepository.getPostsFromUser.mockRejectedValue(TypeError);

            const result = await postService.getUserFeed(dummyUser.PK);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(TypeError);            
        });
    })
});
