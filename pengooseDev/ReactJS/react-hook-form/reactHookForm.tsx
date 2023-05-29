import { useForm } from 'react-hook-form';

export default function Forms() {
  const { register } = useForm();

  return (
    <form onSubmit={onSubmit}>
      <input
        {...register('username', { required: true })}
        type="text"
        placeholder="Username"
      />
      <input
        {...register('email', { required: true })}
        type="email"
        placeholder="Email"
      />
      <input
        {...register('password', { required: true })}
        type="password"
        placeholder="Password"
      />
      <input type="submit" value="Create Account" />
    </form>
  );
}
