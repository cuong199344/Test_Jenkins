import request from "supertest";
import app from "../../app";

it("returns a 201 on successful signup", async () => {
  const response = await request(app)
    .post("/company/api-v1/companies/register")
    .send({
      name: "Tester Tech",
      email: "testercompany@gmail.com",
      password: "123456",
    })
    .expect(201);
});

it("returns a 200 on successful signin", async () => {
  const response = await request(app)
    .post("/company/api-v1/companies/register")
    .send({
      name: "Tester Tech",
      email: "testercompany@gmail.com",
      password: "123456",
    })
    .expect(201);
  const login = await request(app)
    .post("/company/api-v1/companies/login")
    .send({
      email: "testercompany@gmail.com",
      password: "123456",
    })
    .expect(200);
});

it("returns a 404 with an invalid email", async () => {
  return request(app)
    .post("/company/api-v1/companies/register")
    .send({
      name: "Tester Tech",
      email: "testercompany",
      password: "123456",
    })
    .expect(404);
});

it("returns a 404 with an invalid password", async () => {
  return request(app)
    .post("/company/api-v1/companies/register")
    .send({
      name: "Tester Tech",
      email: "testercompany@gmail.com",
      password: "12345",
    })
    .expect(404);
});
it("disallows duplicate emails", async () => {
  await request(app)
    .post("/company/api-v1/companies/register")
    .send({
      name: "Tester Tech",
      email: "testercompany@gmail.com",
      password: "123456",
    })
    .expect(201);

  await request(app)
    .post("/company/api-v1/companies/register")
    .send({
      name: "Tester Tech",
      email: "testercompany@gmail.com",
      password: "123456",
    })
    .expect(404);
});

it("returns a 200 on success get all company", async () => {
  return request(app)
    .get("/company/api-v1/companies/")
    .send()
    .expect(200);
});

it("returns a 200 on get user data success", async () => {
  const response = await request(app)
    .post("/company/api-v1/companies/register")
    .send({
      name: "Tester Tech",
      email: "testercompany@gmail.com",
      password: "123456",
    })
    .expect(201);
  const token = response.body.token;
  const getCompanyDataWithToken = await request(app)
    .post("/company/api-v1/companies/get-company-profile")
    .set({
      "content-type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    })
    .send()
    .expect(200);
  const companyData = getCompanyDataWithToken.body.data;
  expect(companyData).toHaveProperty("jobPosts");
  expect(companyData).toHaveProperty("name");
  expect(companyData).toHaveProperty("email");
});