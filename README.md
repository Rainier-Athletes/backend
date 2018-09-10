# Rainier Athletes Backend API

The RA Backend will be a MongoDB-based API server designed for future enhancement. The initial MVP implementation will feature two models (Profile and PointTracker) along with associated routes.  We will implement an admin function with the ability to initialize profiles with email addresses and roles so that Google Oauth can be used while maintaining access control.

Relationships between models can be deduced from the mock JSON below, but in brief they are:

	- Profile[role=student] to PointTracker, 1:Many
	- Profile[role=student] to Profile[role=coach], 1:Many
	- Profile[role=student] to Profile[role=teacher], 1:Many
	- Profile[role=student] to Profile[role=family], 1:Many
	- Profile[role=student] to Profile[role=mentor], 1:1
	- Profile[role=mentor] to Profile[role=student], 1:Many
	- Profile[role=teacher] to Profile[role=student], 1:Many
	- Profile[role=coach] to Profile[role=student], 1:Many
	- Profile[role=family] to Profile[role=student], 1:Many
	- PointTracker to Profile[role=teacher], 1:Many
	- PointTracker to Profile[role=student], 1:1

## Setup: .env file
```
NODE_ENV=[ development|production ] // pick one
PORT=3000 // server port in dev (localhost)
MONGODB_URI=mongodb://localhost:27017/<your db name> 
SECRET=<your jwt secret> // used to sign web tokens
GOOGLE_OAUTH_ID=<your google oauth id>
GOOGLE_OAUTH_SECRET=<your google oauth secret>
CLIENT_URL=http://localhost:8080 // set this to your deployed frontend when you deploy
API_URL=http://localhost:3000/api/v1 // set this to your deployed backend when you deploy
CORS_ORIGINS=["http://localhost:8080", "<another client url>", "<etc>"] // CORS whitelist for origins
ROOT_ADMIN={"email": "selpilot@gmail.com", "role": "admin"} // use this id to bootstrap oauth signin
```

## Routes

### POST
  - /api/v1/profiles
  - /api/v1/pointstracker
  - /api/v1/synopsis
    - Returns webViewLink, a shareable URL, for the PDF file in the user's google drive:
    ```
    {
        "webViewLink": "https://drive.google.com/file/d/150JHOsRJ0-FqEr6gH4eoufLISAu-aOgA/view?usp=drivesdk"
    }
    ```
    - Body requires name and html parameters. Name is student's name. Html is html string for the synopsis report.

### GET
	- /api/v1/oauth/google
  - /api/v1/profiles?[id | any profile property]=[mongoose._id | corresponding property value]
  - /api/v1/profiles/me
  - /api/v1/pointstracker?[id | any profile property]=[mongoose._id | corresponding property value]
    - We'll need to experiment with the date query to be sure date is formatted correctly. And that it's a valid report date (a Friday).
	-/api/v1/attach?student=mongoose._id&[mentor|coach|teacher|family]=mongoose._id
	-/api/v1/detach?student=mongoose._id&[mentor|coach|teacher|family]=mongoose._id
  - /api/v1/extract?from=date&to=date
    - Extracts pointstracker data to csv and posts to user's google drive.
    - Returns webViewLink, a shareable URL, for the CSV file in the user's google drive:
    ```
    {
        "webViewLink": "https://drive.google.com/file/d/150JHOsRJ0-FqEr6gH4eoufLISAu-aOgA/view?usp=drivesdk"
    }
    ```


### PUT
  - /api/v1/profiles?id=mongoose._id
  - /api/v1/pointstracker?id=mongoose._id

### DELETE
  - /api/v1/profiles?id=mongoose._id
  - /api/v1/pointstracker?id=mongoose._id
  
## Permission Roles

This table may be significantly modified if we can simplify things down to just mentors as users who create students and coaches as needed.

 Role | Profile | PointTracker 
:---|:---:|:---:|:---:
admin | CRUD | CRUD
mentor | RU* | RU
others |  - | -

\*Student profiles only

## Mock JSON

### GET /api/v1/pointstracker?id=5b75bbdd2d60007306e782ef JSON
NOTE: an admin can GET with no query string to retrieve all points trackers, in which case the result will be an array of populated objects
```
    {
        "surveyQuestions": {
            "mentorAttendedCheckin": true,
            "metFaceToFace": true,
            "hadOtherCommunication": false,
            "hadNoCommunication": false,
            "scoreSheetTurnedIn": true,
            "scoreSheetLostOrIncomplete": false,
            "scoreSheetWillBeLate": false,
            "scoreSheetOther": false,
            "scoreSheetOtherReason": "no reason needed in this case",
            "synopsisInformationComplete": true,
            "synopsisInformationIncomplete": false,
            "synopsisCompletedByRaStaff": false
        },
        "synopsisComments": {
            "extraPlayingTime": "ut nemo reprehenderit",
            "mentorGrantedPlayingTime": "one quarter",
            "studentActionItems": "velit est ab",
            "sportsUpdate": "nam repudiandae odit",
            "additionalComments": "cum odio corrupti"
        },
        "_id": "5b96f6ab4be48399f6a56d66",
        "date": "2018-09-10T22:56:43.361Z",
        "student": {
            "studentData": {
                "gender": "male",
                "mentors": [
                    {
                        "_id": "5b96f6aa4be48399f6a56d30",
                        "id": "5b96f6aa4be48399f6a56d2e",
                        "currentMentor": true
                    }
                ],
                "school": [
                    {
                        "_id": "5b96f6aa4be48399f6a56d31",
                        "schoolName": "skyline high school",
                        "currentSchool": true
                    }
                ],
                "coaches": [],
                "sports": [],
                "teachers": [],
                "family": [],
                "lastPointTracker": "5b96f6ab4be48399f6a56d66"
            },
            "active": true,
            "role": "student",
            "students": [],
            "_id": "5b96f6aa4be48399f6a56d2f",
            "firstName": "Daniella",
            "lastName": "Effertz",
            "email": "Giovanni41@hotmail.com",
            "phone": "397.230.9032",
            "__v": 0
        },
        "mentor": {
            "studentData": {
                "coaches": [],
                "sports": [],
                "mentors": [],
                "teachers": [],
                "family": [],
                "school": []
            },
            "active": true,
            "role": "mentor",
            "students": [],
            "_id": "5b96f6aa4be48399f6a56d2e",
            "firstName": "Darien",
            "lastName": "Doyle",
            "email": "Rosalinda_Gerhold30@hotmail.com",
            "phone": "400.385.7439",
            "__v": 0
        },
        "mentorIsSubstitute": false,
        "subjects": [
            {
                "scoring": {
                    "excusedDays": 1,
                    "stamps": 2,
                    "halfStamp": 3,
                    "tutorials": 2
                },
                "_id": "5b96f6ab4be48399f6a56d6d",
                "subjectName": "Gloria",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d3b",
                    "firstName": "Iliana",
                    "lastName": "Collier",
                    "email": "Stuart_Boyle@gmail.com",
                    "__v": 0
                },
                "grade": 70
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b96f6ab4be48399f6a56d6c",
                "subjectName": "Ubaldo",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d42",
                    "firstName": "Madie",
                    "lastName": "Dare",
                    "email": "Dayna56@hotmail.com",
                    "__v": 0
                },
                "grade": 90
            },
            {
                "scoring": {
                    "excusedDays": 1,
                    "stamps": 2,
                    "halfStamp": 3,
                    "tutorials": 2
                },
                "_id": "5b96f6ab4be48399f6a56d6b",
                "subjectName": "Orland",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d49",
                    "firstName": "Edmond",
                    "lastName": "Hartmann",
                    "email": "Chris_Rolfson@hotmail.com",
                    "__v": 0
                },
                "grade": 70
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b96f6ab4be48399f6a56d6a",
                "subjectName": "Bo",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d50",
                    "firstName": "Turner",
                    "lastName": "Jenkins",
                    "email": "Holden_Strosin@yahoo.com",
                    "__v": 0
                },
                "grade": 90
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b96f6ab4be48399f6a56d69",
                "subjectName": "Alana",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d57",
                    "firstName": "Frank",
                    "lastName": "Cole",
                    "email": "Dejah.Renner14@hotmail.com",
                    "__v": 0
                },
                "grade": 90
            },
            {
                "scoring": {
                    "excusedDays": 1,
                    "stamps": 2,
                    "halfStamp": 3,
                    "tutorials": 2
                },
                "_id": "5b96f6ab4be48399f6a56d68",
                "subjectName": "Barton",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d5e",
                    "firstName": "Kelly",
                    "lastName": "Klocko",
                    "email": "Tressie_Tremblay@gmail.com",
                    "__v": 0
                },
                "grade": 70
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b96f6ab4be48399f6a56d67",
                "subjectName": "Jordan",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d65",
                    "firstName": "Macy",
                    "lastName": "Hartmann",
                    "email": "Burley_Carroll79@gmail.com",
                    "__v": 0
                },
                "grade": 90
            }
        ],
        "createdAt": "2018-09-10T22:56:43.387Z",
        "updatedAt": "2018-09-10T22:56:43.387Z",
        "__v": 0
    }

```

### Student Profile: GET /api/v1/profiles?id=5b75bbdd2d60007306e782c7
```
    {
        "studentData": {
            "gender": "male",
            "mentors": [
                {
                    "_id": "5b96f6ab4be48399f6a56d70",
                    "id": {
                        "studentData": {
                            "coaches": [],
                            "sports": [],
                            "mentors": [],
                            "teachers": [],
                            "family": [],
                            "school": []
                        },
                        "active": true,
                        "role": "mentor",
                        "students": [],
                        "_id": "5b96f6ab4be48399f6a56d6e",
                        "firstName": "Gerard",
                        "lastName": "Vandervort",
                        "email": "Kirstin_Rippin71@gmail.com",
                        "phone": "257.659.5795",
                        "__v": 0
                    },
                    "currentMentor": true
                }
            ],
            "school": [
                {
                    "_id": "5b96f6ab4be48399f6a56d71",
                    "schoolName": "skyline high school",
                    "currentSchool": true
                }
            ],
            "coaches": [
                {
                    "_id": "5b96f6ab4be48399f6a56d72"
                },
                {
                    "_id": "5b96f6ab4be48399f6a56d72"
                }
            ],
            "sports": [],
            "teachers": [],
            "family": [
                {
                    "_id": "5b96f6ab4be48399f6a56d74"
                }
            ],
            "lastPointTracker": {
                "surveyQuestions": {
                    "mentorAttendedCheckin": true,
                    "metFaceToFace": true,
                    "hadOtherCommunication": false,
                    "hadNoCommunication": false,
                    "scoreSheetTurnedIn": true,
                    "scoreSheetLostOrIncomplete": false,
                    "scoreSheetWillBeLate": false,
                    "scoreSheetOther": false,
                    "scoreSheetOtherReason": "no reason needed in this case",
                    "synopsisInformationComplete": true,
                    "synopsisInformationIncomplete": false,
                    "synopsisCompletedByRaStaff": false
                },
                "synopsisComments": {
                    "extraPlayingTime": "doloribus esse illum",
                    "mentorGrantedPlayingTime": "one quarter",
                    "studentActionItems": "enim non itaque",
                    "sportsUpdate": "non omnis nostrum",
                    "additionalComments": "aut quis delectus"
                },
                "_id": "5b96f6ab4be48399f6a56da6",
                "date": "2018-09-10T22:56:43.878Z",
                "student": {
                    "studentData": {
                        "gender": "male",
                        "mentors": [
                            {
                                "_id": "5b96f6ab4be48399f6a56d70",
                                "id": "5b96f6ab4be48399f6a56d6e",
                                "currentMentor": true
                            }
                        ],
                        "school": [
                            {
                                "_id": "5b96f6ab4be48399f6a56d71",
                                "schoolName": "skyline high school",
                                "currentSchool": true
                            }
                        ],
                        "coaches": [
                            {
                                "_id": "5b96f6ab4be48399f6a56d72"
                            },
                            {
                                "_id": "5b96f6ab4be48399f6a56d72"
                            }
                        ],
                        "sports": [],
                        "teachers": [],
                        "family": [
                            {
                                "_id": "5b96f6ab4be48399f6a56d74"
                            }
                        ],
                        "lastPointTracker": "5b96f6ab4be48399f6a56da6"
                    },
                    "active": true,
                    "role": "student",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d6f",
                    "firstName": "Kayden",
                    "lastName": "Yost",
                    "email": "Gerson43@yahoo.com",
                    "phone": "325.785.4792",
                    "__v": 0
                },
                "mentor": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "mentor",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d6e",
                    "firstName": "Gerard",
                    "lastName": "Vandervort",
                    "email": "Kirstin_Rippin71@gmail.com",
                    "phone": "257.659.5795",
                    "__v": 0
                },
                "mentorIsSubstitute": false,
                "subjects": [
                    {
                        "scoring": {
                            "excusedDays": 1,
                            "stamps": 2,
                            "halfStamp": 3,
                            "tutorials": 2
                        },
                        "_id": "5b96f6ab4be48399f6a56dad",
                        "subjectName": "Abby",
                        "teacher": {
                            "studentData": {
                                "coaches": [],
                                "sports": [],
                                "mentors": [],
                                "teachers": [],
                                "family": [],
                                "school": []
                            },
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b96f6ab4be48399f6a56d7b",
                            "firstName": "Stephanie",
                            "lastName": "Davis",
                            "email": "Reagan.Bode@hotmail.com",
                            "__v": 0
                        },
                        "grade": 70
                    },
                    {
                        "scoring": {
                            "excusedDays": 3,
                            "stamps": 4,
                            "halfStamp": 1,
                            "tutorials": 1
                        },
                        "_id": "5b96f6ab4be48399f6a56dac",
                        "subjectName": "Jason",
                        "teacher": {
                            "studentData": {
                                "coaches": [],
                                "sports": [],
                                "mentors": [],
                                "teachers": [],
                                "family": [],
                                "school": []
                            },
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b96f6ab4be48399f6a56d82",
                            "firstName": "Elroy",
                            "lastName": "O'Hara",
                            "email": "Eileen64@gmail.com",
                            "__v": 0
                        },
                        "grade": 90
                    },
                    {
                        "scoring": {
                            "excusedDays": 1,
                            "stamps": 2,
                            "halfStamp": 3,
                            "tutorials": 2
                        },
                        "_id": "5b96f6ab4be48399f6a56dab",
                        "subjectName": "Noel",
                        "teacher": {
                            "studentData": {
                                "coaches": [],
                                "sports": [],
                                "mentors": [],
                                "teachers": [],
                                "family": [],
                                "school": []
                            },
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b96f6ab4be48399f6a56d89",
                            "firstName": "Jedediah",
                            "lastName": "Yundt",
                            "email": "Beverly16@gmail.com",
                            "__v": 0
                        },
                        "grade": 70
                    },
                    {
                        "scoring": {
                            "excusedDays": 3,
                            "stamps": 4,
                            "halfStamp": 1,
                            "tutorials": 1
                        },
                        "_id": "5b96f6ab4be48399f6a56daa",
                        "subjectName": "Fern",
                        "teacher": {
                            "studentData": {
                                "coaches": [],
                                "sports": [],
                                "mentors": [],
                                "teachers": [],
                                "family": [],
                                "school": []
                            },
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b96f6ab4be48399f6a56d90",
                            "firstName": "Marcia",
                            "lastName": "Schinner",
                            "email": "Sierra60@yahoo.com",
                            "__v": 0
                        },
                        "grade": 90
                    },
                    {
                        "scoring": {
                            "excusedDays": 3,
                            "stamps": 4,
                            "halfStamp": 1,
                            "tutorials": 1
                        },
                        "_id": "5b96f6ab4be48399f6a56da9",
                        "subjectName": "Westley",
                        "teacher": {
                            "studentData": {
                                "coaches": [],
                                "sports": [],
                                "mentors": [],
                                "teachers": [],
                                "family": [],
                                "school": []
                            },
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b96f6ab4be48399f6a56d97",
                            "firstName": "Keshawn",
                            "lastName": "Kozey",
                            "email": "Helena56@gmail.com",
                            "__v": 0
                        },
                        "grade": 90
                    },
                    {
                        "scoring": {
                            "excusedDays": 1,
                            "stamps": 2,
                            "halfStamp": 3,
                            "tutorials": 2
                        },
                        "_id": "5b96f6ab4be48399f6a56da8",
                        "subjectName": "Fiona",
                        "teacher": {
                            "studentData": {
                                "coaches": [],
                                "sports": [],
                                "mentors": [],
                                "teachers": [],
                                "family": [],
                                "school": []
                            },
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b96f6ab4be48399f6a56d9e",
                            "firstName": "Eileen",
                            "lastName": "Koss",
                            "email": "Dorthy60@yahoo.com",
                            "__v": 0
                        },
                        "grade": 70
                    },
                    {
                        "scoring": {
                            "excusedDays": 3,
                            "stamps": 4,
                            "halfStamp": 1,
                            "tutorials": 1
                        },
                        "_id": "5b96f6ab4be48399f6a56da7",
                        "subjectName": "Zelma",
                        "teacher": {
                            "studentData": {
                                "coaches": [],
                                "sports": [],
                                "mentors": [],
                                "teachers": [],
                                "family": [],
                                "school": []
                            },
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b96f6ab4be48399f6a56da5",
                            "firstName": "Myrtie",
                            "lastName": "Zboncak",
                            "email": "Enoch.Nienow67@gmail.com",
                            "__v": 0
                        },
                        "grade": 90
                    }
                ],
                "createdAt": "2018-09-10T22:56:43.898Z",
                "updatedAt": "2018-09-10T22:56:43.898Z",
                "__v": 0
            }
        },
        "active": true,
        "role": "student",
        "students": [],
        "_id": "5b96f6ab4be48399f6a56d6f",
        "firstName": "Kayden",
        "lastName": "Yost",
        "email": "Gerson43@yahoo.com",
        "phone": "325.785.4792",
        "__v": 0
    }

```

### Mentor (or any adult role) Profile: GET /api/v1/profiles?id=5b75bbdd2d60007306e782c8
```
    {
        "studentData": {
            "coaches": [],
            "sports": [],
            "mentors": [],
            "teachers": [],
            "family": [],
            "school": []
        },
        "active": true,
        "role": "mentor",
        "students": [
            {
                "studentData": {
                    "gender": "male",
                    "mentors": [
                        {
                            "_id": "5b96f6ac4be48399f6a56db8",
                            "id": "5b96f6ac4be48399f6a56db6",
                            "currentMentor": true
                        }
                    ],
                    "school": [
                        {
                            "_id": "5b96f6ac4be48399f6a56db9",
                            "schoolName": "skyline high school",
                            "currentSchool": true
                        }
                    ],
                    "coaches": [],
                    "sports": [],
                    "teachers": [],
                    "family": [],
                    "lastPointTracker": "5b96f6ac4be48399f6a56dee"
                },
                "active": true,
                "role": "student",
                "students": [],
                "_id": "5b96f6ac4be48399f6a56db7",
                "firstName": "Alysa",
                "lastName": "Pollich",
                "email": "Geovanny_Ratke@gmail.com",
                "phone": "644.412.6889",
                "__v": 0
            },
            {
                "studentData": {
                    "gender": "male",
                    "mentors": [
                        {
                            "_id": "5b96f6ac4be48399f6a56db8",
                            "id": "5b96f6ac4be48399f6a56db6",
                            "currentMentor": true
                        }
                    ],
                    "school": [
                        {
                            "_id": "5b96f6ac4be48399f6a56db9",
                            "schoolName": "skyline high school",
                            "currentSchool": true
                        }
                    ],
                    "coaches": [],
                    "sports": [],
                    "teachers": [],
                    "family": [],
                    "lastPointTracker": "5b96f6ac4be48399f6a56dee"
                },
                "active": true,
                "role": "student",
                "students": [],
                "_id": "5b96f6ac4be48399f6a56db7",
                "firstName": "Alysa",
                "lastName": "Pollich",
                "email": "Geovanny_Ratke@gmail.com",
                "phone": "644.412.6889",
                "__v": 0
            }
        ],
        "_id": "5b96f6ac4be48399f6a56db6",
        "firstName": "Candelario",
        "lastName": "Welch",
        "email": "Alicia_Zieme38@gmail.com",
        "phone": "910.080.2409",
        "__v": 0
    }
```

