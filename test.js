import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const specs = [
  { specId: 1, specVal: "spec1" },
  { specId: 2, specVal: "spec2" },
  { specId: 3, specVal: "spec3" },
];
const savedValues = {
  1: [
    { devId: 1, specId: 1, obsVal: "11", specVal: "spec1" },
    { devId: 1, specId: 2, obsVal: "12", specVal: "spec2" },
    { devId: 1, specId: 3, obsVal: "13", specVal: "spec3" },
    { devId: 2, specId: 1, obsVal: "21", specVal: "spec1" },
    { devId: 2, specId: 2, obsVal: "22", specVal: "spec2" },
    { devId: 2, specId: 3, obsVal: "23", specVal: "spec3" },
  ],
};
const devIds = { 1: [{ devId: 1 }, { devId: 2 }], 2: [{ devId: 3 }, { devId: 4 }, { devId: 5 }] };

const totalPages = Object.keys(devIds).length;

const defaultValues = {
  devices: [
    {
      devId: "",
      values: [{ specId: "", specVal: "", obsVal: "" }],
    },
  ],
};
const valSaved = true;

const schema = yup.object({
  devices: yup.array().of(
    yup
      .object({
        devId: yup.number().nullable(),
        values: yup.array().of(
          yup.object({
            specId: yup.number().required(),
            specVal: yup.string().nullable(),
            obsVal: yup.string().when("$parentDevId", (parentDevId, schema) => {
              if (parentDevId) {
                return schema.required("required");
              }
              return schema.notRequired();
            }),
          })
        ),
      })
      .transform((device, originalValue) => {
        // 👇 inject devId into each child’s context
        if (device && Array.isArray(device.values)) {
          device.values = device.values.map((v) => ({
            ...v,
            $parentDevId: device.devId,
          }));
        }
        return device;
      })
  ),
});

export default function Test() {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ defaultValues, resolver: yupResolver(schema) });

  const { fields } = useFieldArray({ name: "devices", control });
  const handleClick = (page) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    if (valSaved && savedValues[currentPage]) {
      const devices = Object.values(
        savedValues[currentPage].reduce((acc, { devId, specId, obsVal, specVal }) => {
          if (!acc[devId]) {
            acc[devId] = {
              devId,
              values: [],
            };
          }
          acc[devId].values.push({
            specId,
            specVal,
            obsVal,
          });
          return acc;
        }, {})
      );
      reset({ devices });
    } else {
      const devices = devIds[currentPage].map((d, i) => ({ ...d, values: specs.map((s) => ({ ...s, obsVal: "" })) }));
      reset({ devices });
    }
  }, [currentPage]);
  console.log(errors, "errors");

  function onSave(data) {
    console.log(data, "data");
  }

  return (
    <div style={{ padding: 32 }}>
      <form onSubmit={handleSubmit(onSave)}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleClick(currentPage - 1)} disabled={currentPage === 1}>
            « Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => handleClick(page)}
                style={{
                  fontWeight: currentPage === page ? "bold" : "normal",
                }}
              >
                {page}
              </button>
            );
          })}

          <button onClick={() => handleClick(currentPage + 1)} disabled={currentPage === totalPages}>
            Next »
          </button>
        </div>

        <table>
          <tbody>
            <tr>
              <td colSpan={2}>devices</td>
              {fields.map((f, ci) => (
                <td key={ci}>
                  <input {...register(`devices.${ci}.devId`)} />
                </td>
              ))}
            </tr>
            <tr>
              <th>s.no</th>
              <th>spec</th>
              <th>observation</th>
            </tr>
            {specs.map((s, ri) => (
              <tr key={s.specId}>
                <td>{ri + 1}</td>
                <td>{s.specVal}</td>

                {fields.map((f, ci) => (
                  <td key={ri + ci}>
                    <Controller
                      name={`devices.${ci}.values.${ri}.obsVal`}
                      control={control}
                      render={({ fieldState: { error }, field }) => {
                        return (
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <input {...field} />
                            <div style={{ color: "red" }}>{error?.message}</div>
                          </div>
                        );
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit">submit </button>
      </form>
    </div>
  );
}
