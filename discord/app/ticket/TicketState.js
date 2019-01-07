module.exports = {

	Unknown: 0,

	Opened: 1,
	OpenedAwaitingChoice: 2,

	Archived: 9999,

	OpenSupport: 100,

	OpenAutomatic: 105,
	OpenAutomaticAwaitingResponse: 106,

	OpenTermsOfService: 200,
	OpenAwaitingTermsOfServiceResponse: 201,
	OpenTermsOfServiceAccepted: 202,

	OpenManualSetup: 205,

	OpenPushed: 900,

	OpenAwaitingFreelancer: 1000,
	OpenFreelancerQuote: 1001,

	OpenPayment: 2000,
	OpenAwaitingPayment: 2002,
	OpenPaymentReceived: 2003,

	OpenInProgress: 1002,

	ClosingAwaitingClientConfirmation: 2001,
	ClosingAwaitingManagementConfirmation: 2002,

	GraceProjectComplete: 5000,
	GraceProjectCancelledByClient: 5001,
	GraceProjectCancelledByManagement: 5002,

};