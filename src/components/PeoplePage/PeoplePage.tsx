import { Loader } from '../Loader/Loader';
import { Link, useParams } from 'react-router-dom';
import { getPeople } from '../../api';
import { useEffect, useState } from 'react';
import { Person } from '../../types';

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const { personSlug } = useParams();

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    getPeople()
      .then(fetchedPeople => {
        const peopleByName: { [key: string]: Person } = {};

        fetchedPeople.forEach(person => {
          peopleByName[person.name] = person;
        });

        const processedPeople = fetchedPeople.map(person => ({
          ...person,
          mother: person.motherName
            ? peopleByName[person.motherName]
            : undefined,
          father: person.fatherName
            ? peopleByName[person.fatherName]
            : undefined,
        }));

        setPeople(processedPeople);
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <h1 className="title">People Page</h1>

      <div className="block">
        <div className="box table-container">
          {isLoading && <Loader />}

          {hasError && !isLoading && (
            <p data-cy="peopleLoadingError" className="has-text-danger">
              Something went wrong
            </p>
          )}

          {!hasError && !isLoading && people.length === 0 && (
            <p data-cy="noPeopleMessage">There are no people on the server</p>
          )}

          {!isLoading && !hasError && people.length > 0 && (
            <table
              data-cy="peopleTable"
              className="table is-striped is-hoverable is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sex</th>
                  <th>Born</th>
                  <th>Died</th>
                  <th>Mother</th>
                  <th>Father</th>
                </tr>
              </thead>

              <tbody>
                {people.map(person => {
                  return (
                    <tr
                      data-cy="person"
                      className={
                        person.slug === personSlug
                          ? 'has-background-warning'
                          : ''
                      }
                      key={person.name}
                    >
                      <td>
                        <Link
                          className={
                            person.sex === 'f' ? 'has-text-danger' : ''
                          }
                          to={`/people/${person.slug}`}
                        >
                          {person.name}
                        </Link>
                      </td>
                      <td>{person.sex}</td>
                      <td>{person.born}</td>
                      <td>{person.died}</td>
                      <td>
                        {person.mother ? (
                          <Link
                            className="has-text-danger"
                            to={`/people/${person.mother.slug}`}
                          >
                            {person.mother.name}
                          </Link>
                        ) : person.motherName ? (
                          person.motherName
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {person.father ? (
                          <Link to={`/people/${person.father.slug}`}>
                            {person.father.name}
                          </Link>
                        ) : person.fatherName ? (
                          person.fatherName
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};
