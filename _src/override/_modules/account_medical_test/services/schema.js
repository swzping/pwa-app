import {gql} from '@apollo/client';

export const GET_CUSTOMER_MEDICAL_TEST = gql`
  query getMedicalTest {
    customer {
      test_tanggal
      test_lokasi
      test_gula_darah_hasil
      test_kolesterol_hasil
      test_tekanan_darah_hasil
      test_asam_urat_hasil
    }
  }
`;
