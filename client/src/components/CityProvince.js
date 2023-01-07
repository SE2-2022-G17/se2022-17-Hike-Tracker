import React from 'react';
import Comuni from '../constants/comuni.json';
import Form from 'react-bootstrap/Form';


export default function CityProvince(props) {
    const { province, setProvince, setCity } = props;

    return (
        <>
            <Form.Select
                className="form-select"
                aria-label="Default select province"
                onChange={e => {
                    setCity(undefined);
                    setProvince(undefined);
                    setProvince(e.target.value);
                }}
                defaultValue={"Select province"}>
                <option disabled>Select province</option>
                {Object.keys(Comuni).sort().map(p => (
                    <option
                        key={p}
                        value={p}>
                        {p}
                    </option>
                ))}
            </Form.Select>
            <Form.Select
                className="form-select"
                aria-label="Default select city"
                onChange={e => setCity(e.target.value)}
                defaultValue={"Select city"}
            >
                <option disabled>Select city</option>
                {Comuni[province] !== undefined ? Comuni[province].map(c => (
                    <option
                        key={c}
                        value={c}>
                        {c}
                    </option>
                )) : undefined}
            </Form.Select>
        </>
    );
}