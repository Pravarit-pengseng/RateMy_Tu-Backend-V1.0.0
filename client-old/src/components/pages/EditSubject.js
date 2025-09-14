import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { read, update } from "../../functions/subject";

const FormEditProduct = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    code: "",
    name: "",
    detail: "",
    teacher: "",
  });
  const [fileold, setFileOld] = useState();

  useEffect(() => {
    loadData(params.id);
  }, []);

  const loadData = async (id) => {
    read(id).then((res) => {
      setData(res.data);
      setFileOld(res.data.file);
    });
  };
  const handleChange = (e) => {
    if (e.target.name === "file") {
      setData({
        ...data,
        [e.target.name]: e.target.files[0],
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    console.log(fileold);
    const formWithImageData = new FormData();
    for (const key in data) {
      formWithImageData.append(key, data[key]);
    }
    formWithImageData.append("fileold", fileold);
    update(params.id, formWithImageData)
      .then((res) => {
        console.log(res);
        navigate("/#");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      EditSubject
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="code"
          onChange={(e) => handleChange(e)}
          placeholder="code"
          value={data.name}
        />{" "}
        <br />
        <input
          type="text"
          name="name"
          onChange={(e) => handleChange(e)}
          placeholder="name"
          value={data.name}
        />{" "}
        <br />
        <input
          type="text"
          name="detail"
          placeholder="detail"
          value={data.detail}
          onChange={(e) => handleChange(e)}
        />
        <br />
        {/* <input type='file'
                    name='file'
                    onChange={e => handleChange(e)}
                /><br /> */}
        <input
          type="text"
          name="teacher"
          placeholder="teacher"
          value={data.price}
          onChange={(e) => handleChange(e)}
        />
        <br />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default FormEditProduct;
