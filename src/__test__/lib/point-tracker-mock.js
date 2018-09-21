import faker from 'faker';
import PointTracker from '../../model/point-tracker';
import { createProfileMockPromise, removeAllResources as removeProfileResources } from './profile-mock';

const randomVal = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomGrade = () => {
  const grades = ['A', 'B', 'C', 'D', 'F'];
  return grades[randomVal(0, grades.length - 1)];
};

const createPointTrackerMockPromise = async (elementaryStudent = false) => {
  const mockData = {};

  const profileData = await createProfileMockPromise();

  mockData.profileData = profileData;


  const getTeacher = async () => {
    const mock = await createProfileMockPromise();
    mock.teacherProfile.students.push(mockData.profileData.studentProfile._id.toString());
    await mock.teacherProfile.save();
    return mock.teacherProfile._id.toString();
  };
  const teachers = [];
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
 
  const mockPointTracker = {
    title: 'Mock Point Tracker Title',
    student: mockData.profileData.studentProfile._id,
    mentor: mockData.profileData.mentorProfile._id,
    mentorIsSubstitute: false,
    subjects: [],
    surveyQuestions: {
      mentorAttendedCheckin: true,
      metFaceToFace: true,
      hadOtherCommunication: false,
      hadNoCommunication: false,
      scoreSheetTurnedIn: true,
      scoreSheetLostOrIncomplete: false,
      scoreSheetWillBeLate: false,
      scoreSheetOther: false,
      scoreSheetOtherReason: 'no reason needed in this case',
      synopsisInformationComplete: true,
      synopsisInformationIncomplete: false,
      synopsisCompletedByRaStaff: false,
    },
    synopsisComments: {
      extraPlayingTime: faker.lorem.words(3),
      mentorGrantedPlayingTime: 'one quarter',
      studentActionItems: faker.lorem.words(3),
      sportsUpdate: faker.lorem.words(3),
      additionalComments: faker.lorem.words(3),
    },
  };

  // populate subjects
  const numSubjects = elementaryStudent ? 4 : 7;
  for (let i = 0; i < numSubjects; i++) {
    const newSubject = {
      subjectName: faker.name.firstName(),
      teacher: teachers[i],
      scoring: {
        excusedDays: randomVal(0, 4),
        stamps: randomVal(0, 8),
        halfStamps: 0,
        tutorials: elementaryStudent ? 0 : randomVal(0, 5),
      },
      grade: elementaryStudent ? '' : randomGrade(),
    };
    newSubject.halfStamps = randomVal(0, 8) - newSubject.stamps;
    mockPointTracker.subjects.push(newSubject);
  }

  let pointTracker;
  try {
    pointTracker = await new PointTracker(mockPointTracker).save();
  } catch (err) {
    console.log(`cptm error on save: ${err}`);
  }
  mockData.mockProfiles = profileData;
  mockData.pointTracker = pointTracker;

  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    removeProfileResources(),
    PointTracker.deleteMany({}),
  ]);
};

export { createPointTrackerMockPromise, removeAllResources };
