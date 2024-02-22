import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { bankAccountService } from "../../../../../app/services/bankAccountService";
import { currencyStringToNumber } from "../../../../../app/utils/currencyStringToNumber";
import { useDashboard } from "../../components/DashboardContext/useDashboard";

const schema = z.object({
  initialBalance:
    z.string().min(1, 'Saldo inicial é obrigatório'),
  name: z.string().min(1, 'Nome da conta é obrigatório'),
  type: z.enum(['CHECKING', 'INVESTMENT', 'CASH']),
  color: z.string().min(1, 'Cor é obrigatória')
})

type FormData = z.infer<typeof schema>

export function useNewAccountModalController() {

  const {
    isNewAccountModalOpen,
    closeNewAccountModal
  } = useDashboard()

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const queryClient = useQueryClient()

  const { isPending, mutateAsync } = useMutation({
    mutationFn: bankAccountService.create,
  })

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync({
        color: data.color,
        initialBalance: currencyStringToNumber(data.initialBalance),
        name: data.name,
        type: data.type
      })

      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
      toast.success('Conta foi cadastrada com sucesso!');

      closeNewAccountModal()
      reset()
    } catch {
      toast.error('Erro ao cadastrar conta!')
    }
  })

  return {
    isNewAccountModalOpen,
    closeNewAccountModal,
    handleSubmit,
    register,
    errors,
    control,
    isPending
  }
}