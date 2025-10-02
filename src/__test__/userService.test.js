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

describe("User Update Suite", () => {

// Users can edit account details
    // description
    // 

})

describe("User Deletion Suite", () => {
    beforeEach(() => {
        //userRepository.postUser.mockReturnValue(null);
        //userRepository.getUserByUsername.mockClear();
        //userRepository.getUserbyId.mockClear(null);
    })

    test("deleting a valid user should return their user object", async () => {
        
    });

    // must be logged in to delete a user
    // cannot delete a different user
    // Possibly even have them type in their password in order to delete a user

    test("")
})