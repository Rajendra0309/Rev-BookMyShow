const User = require('../models/User');
const Notification = require('../models/Notification');

const triggerMovieCreatedLambda = async ({ movieId, title, message }) => {
    const lambdaUrl = process.env.MOVIE_NOTIFY_LAMBDA_URL;

    if (!lambdaUrl) {
        return { invoked: false, reason: 'MOVIE_NOTIFY_LAMBDA_URL not configured' };
    }

    const payload = {
        eventType: 'MOVIE_CREATED',
        movie: {
            id: movieId,
            title
        },
        message,
        triggeredAt: new Date().toISOString()
    };

    const headers = { 'Content-Type': 'application/json' };
    if (process.env.MOVIE_NOTIFY_LAMBDA_API_KEY) {
        headers['x-api-key'] = process.env.MOVIE_NOTIFY_LAMBDA_API_KEY;
    }

    const response = await fetch(lambdaUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Lambda invocation failed with status ${response.status}`);
    }

    return { invoked: true };
};

const notifyCustomersForMovie = async (movie) => {
    const customers = await User.find({ role: 'Customer', status: 'Active' }).select('_id');

    if (customers.length === 0) {
        return { notifiedUsers: 0, lambdaInvoked: false };
    }

    const message = `New movie added: ${movie.title}. Check it out now.`;

    await Notification.insertMany(
        customers.map((customer) => ({
            userId: customer._id,
            movieId: movie._id,
            message,
            status: 'Unread'
        }))
    );

    let lambdaInvoked = false;
    try {
        const lambdaResult = await triggerMovieCreatedLambda({
            movieId: movie._id.toString(),
            title: movie.title,
            message
        });
        lambdaInvoked = Boolean(lambdaResult.invoked);
    } catch (error) {
        console.error('Movie notification lambda call failed:', error.message);
    }

    return {
        notifiedUsers: customers.length,
        lambdaInvoked
    };
};

module.exports = {
    notifyCustomersForMovie
};
