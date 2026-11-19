import useEventBooking from './_controller';
import Views from './_view';

const EventBookingScreen = () => <Views {...useEventBooking()} />;

export default EventBookingScreen;
