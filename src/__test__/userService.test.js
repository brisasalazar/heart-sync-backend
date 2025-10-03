jest.mock('../repository/userRepository');
const userRepository = require('../repository/userRepository');
const userService = require('../service/userService');

describe("User Posting Suite", () => {
    beforeEach(() => {
        userRepository.postUser.mockReturnValue(null);
        userRepository.getUserByUsername.mockClear();
        //userRepository.getUserbyId.mockClear(null);
    })

    test("post a valid user should get correct username and password", async () => {
        userRepository.postUser.mockReturnValue({
            following:[],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUser = {
            username: 'revature101',
            password: 'pass1',
            email: 'example@revature.net'
        }

        const newUser = await userService.postUser(dummyUser);

        expect(newUser.username).toBe("revature101");
        expect(userRepository.postUser).toHaveBeenCalled();
    });

    test("Cannot post an invalid user object", async () => {
        const newUser = await userService.postUser(null);

        expect(newUser).toBeNull();
    });

    test("Cannot post an user if their username is already in use", async () => {
        userRepository.getUserByUsername.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUser = {
            username: 'revature101',
            password: 'pass1',
            email: 'example@revature.net'
        }

        const newUser = await userService.postUser(dummyUser);

        expect(newUser).toBeNull();
    });

    test("Cannot post a user if their email is already in use", async () => {
        userRepository.getUserByUsername.mockReturnValue(null);
        
        userRepository.getUserByEmail.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUser = {
            username: 'revature101',
            password: 'pass1',
            email: 'example@revature.net'
        }

        const newUser = await userService.postUser(dummyUser);
        expect(userRepository.getUserByUsername).toHaveBeenCalled();
        expect(userRepository.getUserByEmail).toHaveBeenCalled();

        expect(newUser).toBeNull();
    })

    test("Cannot post a user with invalid credentials", async () => {
        userRepository.getUserByUsername.mockReturnValue(null);

        const dummyUser = {
            username: 'revature101',
            password: '',
            email: 'example@revature.net'
        }

        const newUser = await userService.postUser(dummyUser);

        expect(newUser).toBeNull();
    });

    test("Handling database failure on valid employee posting", async () => {
        userRepository.postUser.mockReturnValue(null);

        const dummyUser = {
            username: 'revature101',
            password: '',
            email: 'example@revature.net'
        };

        const newUser = await userService.postUser(dummyUser);

        expect(newUser).toBeNull();

    });
})

describe("User Login Suite", () => {
    beforeEach(() => {

    })

    const bcrypt = require('bcrypt');
    test("Validate Login works with valid password and username", async () => {
        userRepository.getUserByUsername.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUsername = "revature101";
        const dummyPassword = "pass1";

        const loginValidation = await userService.validateLogin(dummyUsername, dummyPassword);
        expect(userRepository.getUserByUsername).toHaveBeenCalled();
        expect(loginValidation.username).toBe(dummyUsername);
    })
    
     test("Validating Login with invalid Username or Password returns null", async () => {
        const dummyUsername = null;
        const dummyPassword = "pass2";

        const loginValidation = await userService.validateLogin(dummyUsername, dummyPassword);
        expect(loginValidation).toBeNull();
    })

    test("Validating Login that doesn't match an employee returns null", async () => {
        userRepository.getUserByUsername.mockReturnValue(null);

        const dummyInvalidUsername = "user2X";
        const dummyPassword = "pass1";

        const loginValidation = await userService.validateLogin(dummyInvalidUsername, dummyPassword);
        expect(loginValidation).toBeNull();
    })

    test("Validating Login with an incorrect password returns null", async () => {
        userRepository.getUserByUsername.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUsername = "revature101";
        const dummyPassword = "pass3O3";

        const loginValidation = await userService.validateLogin(dummyUsername, dummyPassword);
        expect(loginValidation).toBeNull();
    })
})

describe("User Update Description Suite", () => {

// Users can edit account details
    test("Updating a user's description should return an object with a new description", async () => {
        userRepository.updateUserFields.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            description: "This is the new updated description",
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        userRepository.getUserbyUserId.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUserId = "USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef";
        const dummyDescription = "This is the new updated description";

        const updatedUser = await userService.updateUserDescription(dummyUserId, dummyDescription);
        expect(userRepository.updateUserFields).toHaveBeenCalled();
        expect(updatedUser.description).toBe(dummyDescription);
    })

    test("Updating a user's description with a null user_id or description should return null", async () => {
        const dummyUserId = null;
        const dummyDescription = "This is the new updated description";

        const updatedUser = await userService.updateUserDescription(dummyUserId, dummyDescription);
        expect(updatedUser).toBeNull;
    })

    test("Updating a user's description with an invalid user_id should return null", async () => {
        userRepository.getUserbyUserId.mockReturnValue(null);

        const dummyUserId = "USER#user///54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef";
        const dummyDescription = "This is the new updated description";

        const updatedUser = await userService.updateUserDescription(dummyUserId, dummyDescription);
        expect(userRepository.getUserbyUserId).toHaveBeenCalled();
        expect(updatedUser).toBeNull;

    })

    test("Handling server side errors", async () => {
        userRepository.getUserbyUserId.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        userRepository.updateUserFields.mockReturnValue(null);

        const dummyUserId = "USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef";
        const dummyDescription = "This is the new updated description";

        const updatedUser = await userService.updateUserDescription(dummyUserId, dummyDescription);
        expect(userRepository.getUserbyUserId).toHaveBeenCalled();
        expect(userRepository.updateUserFields).toHaveBeenCalled();

        expect(updatedUser).toBeNull;
    })
})

describe("User Update Password Suite", () => {
    beforeEach(() => {
        userRepository.getUserbyUserId.mockReturnValue(null);
        userRepository.updateUserFields.mockReturnValue(null);
    })

    test("Updating a user's password returns an object with a correct new password", async () => {
        userRepository.getUserbyUserId.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        userRepository.updateUserFields.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$suYal5aFAB3XJQjT74fiUuDTYFpqcuC5xeHy2txwKake2izMm.EPO',
            username: 'revature101',
            description: "This is the new updated description",
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUserId = "USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef"
        const dummyOldPassword = "pass1";
        const dummyNewPassword = "password1011$";

        const updatedUser = await userService.updateUserPassword(dummyUserId, dummyOldPassword, dummyNewPassword);
        expect(userRepository.updateUserFields).toHaveBeenCalled();
        expect(updatedUser.password).toBe("$2b$10$suYal5aFAB3XJQjT74fiUuDTYFpqcuC5xeHy2txwKake2izMm.EPO");
    })


    test("Trying to update a user's password with an null password returns null", async () => {
        const dummyUserId = "USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef"
        const dummyOldPassword = "pass1";
        const dummyNewPassword = null;

        const updatedUser = await userService.updateUserPassword(dummyUserId, dummyOldPassword, dummyNewPassword);
        expect(updatedUser).toBeNull();
    })

    test("Updating a user's password with the same password doesn't work", async () => {
        const dummyUserId = "USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef"
        const dummyOldPassword = "pass1";
        const dummyNewPassword = "pass1";

        const updatedUser = await userService.updateUserPassword(dummyUserId, dummyOldPassword, dummyNewPassword);
        expect(updatedUser).toBeNull();
    })

    test("Giving the wrong current password returns null", async () => {
        userRepository.getUserbyUserId.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUserId = "USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef"
        const dummyOldPassword = "passOne";
        const dummyNewPassword = "password1011$";

        const updatedUser = await userService.updateUserPassword(dummyUserId, dummyOldPassword, dummyNewPassword);
        expect(updatedUser).toBeNull();
    })

    // test("", async () => {
        
    // })
})

describe("User Deletion Suite", () => {
    beforeEach(() => {
        //userRepository.postUser.mockReturnValue(null);
        //userRepository.getUserByUsername.mockClear();
        userRepository.getUserbyUserId.mockReturnValue(null);
        userRepository.deleteUser.mockReturnValue(null);
    })

    test("deleting a valid user should return their user object", async () => {
        userRepository.getUserbyUserId.mockReturnValue({
            SK: 'METADATA',
            password: '$2b$10$YhgBdJ0bAIKMZrzukbMp8.iBQP3gXagXL/JuKGmtWrQrv0roNl6w2',
            username: 'user2',
            PK: 'USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f',
            description: 'I am User 2 and I love listening to Salsa music',
            email: 'user2@revature.com'
        });

        userRepository.deleteUser.mockReturnValue({
            SK: 'METADATA',
            password: '$2b$10$YhgBdJ0bAIKMZrzukbMp8.iBQP3gXagXL/JuKGmtWrQrv0roNl6w2',
            username: 'user2',
            PK: 'USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f',
            description: 'I am User 2 and I love listening to Salsa music',
            email: 'user2@revature.com'
        });


        const dummyUserId = "USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f";
        const dummyPassword = "pass1";

        const deletedUser = await userService.deleteUser(dummyUserId, dummyPassword);
        expect(deletedUser.PK).toBe(dummyUserId);

    });

    test("Trying to delete a user with a null user_id or password will return null", async () => {
        const dummyUserId = "USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f";
        const dummyPassword = null;

        const deletedUser = await userService.deleteUser(dummyUserId, dummyPassword);
        expect(deletedUser).toBeNull();
    }) 

    test("Trying to delete a user by sending the wrong password will return null", async () => {
        userRepository.getUserbyUserId.mockReturnValue({
            SK: 'METADATA',
            password: '$2b$10$YhgBdJ0bAIKMZrzukbMp8.iBQP3gXagXL/JuKGmtWrQrv0roNl6w2',
            username: 'user2',
            PK: 'USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f',
            description: 'I am User 2 and I love listening to Salsa music',
            email: 'user2@revature.com'
        });
        // have a check in the service layer that the password send in is equal to the one in the database
        
        const dummyUserId = "USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f";
        const dummyPassword = "passOne";

        const deletedUser = await userService.deleteUser(dummyUserId, dummyPassword);
        expect(deletedUser).toBeNull();
    })

    test("Trying to delete a user by sending the wrong user_id will return null", async () => {
        // not sure if this is even possible
        userRepository.getUserbyUserId.mockReturnValue({
            following:['user5dbd0e3b-6718-46ca-9867-f2df7765fea5'],
            SK: 'METADATA',
            password: '$2b$10$RZWpneGNmJjUsDjNWastAumap/NrDmqDvRzb3obROPTLMtZ4rjR4e',
            username: 'revature101',
            PK: 'USER#user54fcb9e1-5d8e-4d43-bd99-69cf01e8a9ef',
            email: 'example@revature.net'
        })

        const dummyUserId = "USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f";
        const dummyPassword = "pass1";

        const deletedUser = await userService.deleteUser(dummyUserId, dummyPassword);
        expect(deletedUser).toBeNull();
    })
    // must be logged in to delete a user
    // cannot delete a different user
    // Possibly even have them type in their password in order to delete a user

    // test("")
})