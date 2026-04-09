import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import Header from '../Header.jsx';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../../components/UI/ErrorBlock.jsx'
import Modal from '../UI/Modal.jsx'

export default function EventDetails() {
  const[isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal}) => fetchEvent({signal, id: params.id})
  });

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: deleteError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');
    }
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate( {id: params.id});

  }

  let content;

  if (isPending) {
    content = (
    <div id="event-details-content" className="center"> 
      <p>Buscando datos del evento...</p>
    </div>
    );
  }

  if ( isError) {
    content = 
    (<div id="event-details-content" className="center"> 
      <ErrorBlock 
      title="FALLO AL CARGAR EVENTO"
      message={error.info?.message || 'Fallos al cargar la inforamcion del evento, intente de nuevo'}/>
    </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleString('es-MX',{
      day: 'numeric', month: 'short', year: 'numeric'

    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
          </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
              <p id="event-details-description">{data.description}</p>
            </div>
        </div>
      </>
        );
  }

  return (
    <>
    {isDeleting && (<Modal onClose={handleStopDelete}>
      <h2>Eliminar Evento</h2>
      <p>¿Quieres eliminar el evento? Esta accion no puede deshacerse</p>
      <div className='form-actions'>
        {isPendingDeletion && <p>Eliminando...</p>};
        {!isPendingDeletion && (
          <>
            <button onClick={handleStopDelete} className='button-text'>Cancelar</button>
            <button onClick={handleDelete} className='button'>Eliminar</button>
          </>
        )};
      </div>
      {isErrorDeleting && (<ErrorBlock 
      title="FALLO AL ELIMINAR EVENTO"
      message={deleteError.info?.message || 
      "Error al eliminar evento, intente de nuevo mas tarde"}/>
      )};
    </Modal>)}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
