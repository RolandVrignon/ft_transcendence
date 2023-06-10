// import axios from 'axios'

const Login = () => {

  // async function loginBackApi() {
  //       try {
          
  //         const CheckConnect = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a672fd80ce2f029d5ff47b1c3f7f409fbe73cafcedb7f3b4cf7e8efc39f22a00&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fcallback&response_type=code';
  //         await axios.get(CheckConnect)
  //         .then(response => {
  //           console.log('app: HTTP request from front to back passed through.');
  //         })
  //         .catch(error => {
  //           console.log('app: HTTP request from front to back failed.');
  //         });
  //       }
  //       catch (error) {
  //         console.error(error);
  //       }
  //     }
      
      async function handleSubmit() {
        const loginUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a672fd80ce2f029d5ff47b1c3f7f409fbe73cafcedb7f3b4cf7e8efc39f22a00&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fcallback%2FhandleUserStatus&response_type=code';
        window.location.href = loginUrl;
        // loginBackApi();
      }
  
  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
};


export default Login;
