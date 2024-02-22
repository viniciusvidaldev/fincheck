import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { authService } from "../../../app/services/authService";
import { SignupParams } from "../../../app/services/authService/signup";

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('Informe um e-mail válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve conter pelo menos 8 dígitos')
})

type FormData = z.infer<typeof schema>

export function useRegisterController() {
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: SignupParams) => authService.signup(data)
  })

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const responseData = await mutateAsync(data)

      console.log(responseData)
    } catch {
      toast.error('Ocorreu um erro ao criar a sua conta!')
    }
  })

  return {
    handleSubmit,
    register,
    errors,
    isPending
  }
}