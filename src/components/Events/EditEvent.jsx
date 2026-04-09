import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx'

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const {data, isPending, isError, error} = useQuery({
    queryFn: ({signal}) =>fetchEvent({id: params.id, signal})
  })

  const {mutate} = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({queryKey: ['events', params.id]});
      queryClient.setQueryData(['events', params.id], newEvent);
    }

  })

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../');
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
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>)
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
