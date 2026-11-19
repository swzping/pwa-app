import * as Colors from '@app/styles/colors';

export const tagStylesMedicalTest = {
  body: {
    fontSize: 12,
  },
  h1: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  h2: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  h3: {
    color: Colors.BLACK,
    fontWeight: 'normal',
  },
  h4: {
    color: Colors.BLACK,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  p: {
    lineHeight: 18,
    margin: 0,
    marginBottom: 5,
  },
  a: {
    color: Colors.BLACK,
  },
  ul: {
    listStyleType: 'none',
    paddingLeft: 0,
    paddingTop: 0,
  },
};

export const classesStylesMedicalTest = {
  medical: {
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  'medical-date': {
    marginTop: 10,
  },
  'medical-city': {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 15,
    marginBottom: -15,
  },
};
