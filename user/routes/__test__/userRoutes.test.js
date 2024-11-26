import request from "supertest";
import  app  from "../../app";

it("returns a 201 on successful signup", async () => {
  const response =  await request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test@gmail.com",
      password: "123456",
    })
    .expect(201);

});

it("returns a 200 on successful signin", async () => {
  const response = await request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test@gmail.com",
      password: "123456",
    })
    .expect(201);
  const signin = await request(app)
    .post("/api-v1/users/login")
    .send({
      email: "test@gmail.com",
      password: "123456",
    })
    .expect(201);
});

it("returns a 404 on failed signin", async () => {
  const response = await request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test@gmail.com",
      password: "123456",
    })
    .expect(201);
  const signin = await request(app)
    .post("/api-v1/users/login")
    .send({
      email: "test@gmail.com",
      password: "1234567",
    })
    .expect(404);
});

it("returns a 404 with an invalid email", async () => {
  return request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test",
      password: "123456",
    })
    .expect(404);
});

it("returns a 404 with an invalid password", async () => {
  return request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test@gmail.com",
      password: "12345",
    })
    .expect(404);
});


it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test@gmail.com",
      password: "123456",
    })
    .expect(201);


  await request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test@gmail.com",
      password: "123456",
    })
    .expect(404);
});


it("returns a 200 on get user data success", async () => {
  const response = await request(app)
    .post("/api-v1/users/register")
    .send({
      firstName: "Test FN",
      lastName: "Test LN",
      email: "test@gmail.com",
      password: "123456",
    })
    .expect(201);
  const token = response.body.token;
  const getUserDataWithToken = await request(app)
    .post("/api-v1/users/get-user")
    .set({
      "content-type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    })
    .send()
    .expect(200);
  const userData = getUserDataWithToken.body.user;
  expect(userData).toHaveProperty("firstName");
  expect(userData).toHaveProperty("lastName");
  expect(userData).toHaveProperty("email");
  
});
