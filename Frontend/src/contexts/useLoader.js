import { useContext } from 'react';
import LoaderContext from './LoaderContextInstance';

const useLoader = () => useContext(LoaderContext);

export default useLoader;
