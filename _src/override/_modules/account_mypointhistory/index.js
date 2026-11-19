import useMyPointHistory from './_controller';
import Views from './_view';

const MyPointHistory = () => <Views {...useMyPointHistory()} />;

export default MyPointHistory;
