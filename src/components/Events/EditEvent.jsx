import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx'

export default function EditEvent() {
  const navigate = useNavigate();
  const { state, } = useNavigation
  const submit = useSubmit();
  const params = useParams();

  const {data, isPending, isError, error} = useQuery({
    queryFn: ({signal}) =>fetchEvent({id: params.id, signal}),
    staleTime: 10000
  })

  // const {mutate} = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({queryKey: ['events', params.id]});
  //     const previousEvent = queryClient.getQueryData(['events', params.id]);

  //     queryClient.setQueryData(['events', params.id], newEvent);
      
  //     return { previousEvent }
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', params.id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', params.id]);
  //   }

  // });

  function handleSubmit(formData) {
    // mutate({ id: params.id, event: formData });
    // navigate('../');
    submit(formData, {
      method: 'PUT'
    });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = <div className='center'> <LoadingIndicator/></div>
  };

  if (error) {
    content = 
    <>
      <ErrorBlock 
      title="ERROR AL CARGAR EVENTO"
      message={error.info?.message || "Error al cargar el evento, verifique los valores ingresados e intente de nuevo"}
      />
      <div className='form-actions'>
        <Link to="../" className='button'>
          Okay
        </Link>
      </div>
    </>
  }

  if (data) {
    content = (<EventForm inputData={data} onSubmit={handleSubmit}>
        { state === 'submitting' ? <p> Enviando datos...</p> : 
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </>}
      </EventForm>)
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export function loader({params}) {
  queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params}) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  queryClient.invalidateQueries(['events']);
  return redirect('../');
}