import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://10.102.68.90:3000', //https://fun-adversely-arachnid.ngrok-free.app
  prepareHeaders: (headers, { getState }) => {
    const token = getState().login.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const courtsApi = createApi({
  reducerPath: 'courtsApi',
  baseQuery,
  endpoints: (builder) => ({
    getCourts: builder.query({
      query: () => 'getcourts',
    }),
    getAccount: builder.query({
      query: () => 'getaccount',
    }),
    createCourt: builder.mutation({
      query: (newCourt) => ({
        url: 'admin/courts',
        method: 'POST',
        body: newCourt,
      }),
    }),
    updateCourt: builder.mutation({
      query: ({ CourtID, ...patch }) => ({
        url: `admin/courts/${CourtID}`,
        method: 'PATCH',
        body: patch,
      }),
    }),
    deleteCourt: builder.mutation({
      query: (CourtID) => ({
        url: `admin/courts/${CourtID}`,
        method: 'DELETE',
      }),
    }),
    getAllAccounts: builder.query({
      query: () => 'admin/customers',
    }),
    deleteAccount: builder.mutation({
      query: (CustomerID) => ({
        url: `customers/${CustomerID}`,
        method: 'DELETE',
      }),
    }),
    createAccount: builder.mutation({
      query: (newAccount) => ({
        url: 'createaccount',
        method: 'POST',
        body: newAccount,
      }),
    }),
    modifyAccount: builder.mutation({
      query: (account) => ({
        url: 'modaccount',
        method: 'PATCH',
        body: account,
      }),
    }),
    createAppointment: builder.mutation({
      query: (newAppointment) => ({
        url: 'createappointments',
        method: 'POST',
        body: newAppointment,
      }),
    }),
    getAppointments: builder.query({
      query: () => 'getappointments',
    }),
    deleteAppointment: builder.mutation({
      query: (AppointmentID) => ({
        url: `deleteappointments/${AppointmentID}`,
        method: 'DELETE',
      }),
    }),
    markAppointmentMissed: builder.mutation({
      query: ({AppointmentID, CourtID, Time}) => ({
        url: `missappointments/${AppointmentID}/miss`,
        method: 'PATCH',
        body: { CourtID, Time },
      }),
    }),
    markAppointmentCompleted: builder.mutation({
      query: ({AppointmentID, CourtID, Time}) => ({
        url: `completeappointments/${AppointmentID}/complete`,
        method: 'PATCH',
        body: { CourtID, Time },
      }),
    }),
    getAllAppointments: builder.query({
      query: () => 'admin/appointments',
    }),
    markAppointmentOnGoing: builder.mutation({
      query: ({AppointmentID}) => ({
        url: `ongoingappointments/${AppointmentID}/ongoing`,
        method: 'PATCH',
        body: { AppointmentID },
      }),
    }),
    CancelAppointment: builder.mutation({
      query: ({AppointmentID, CourtID, Time}) => ({
        url: `cancelappointments/${AppointmentID}/cancel`,
        method: 'PATCH',
        body: { CourtID, Time },
      }),
    }),
    ConfirmPayment: builder.mutation({
      query: ({AppointmentID}) => ({
        url: `confirmappointments/${AppointmentID}/confirm`,
        method: 'PATCH',
        body: { AppointmentID },
      }),
    }),
  }),
});

export const {
  useGetCourtsQuery,
  useGetAccountQuery,
  useCreateCourtMutation,
  useUpdateCourtMutation,
  useDeleteCourtMutation,
  useGetAllAccountsQuery,
  useDeleteAccountMutation,
  useCreateAccountMutation,
  useModifyAccountMutation,
  useCreateAppointmentMutation,
  useGetAppointmentsQuery,
  useDeleteAppointmentMutation,
  useMarkAppointmentMissedMutation,
  useMarkAppointmentCompletedMutation,
  useGetAllAppointmentsQuery,
  useMarkAppointmentOnGoingMutation,
  useCancelAppointmentMutation,
  useConfirmPaymentMutation,
} = courtsApi;