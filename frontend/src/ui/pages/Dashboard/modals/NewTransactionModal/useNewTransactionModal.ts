import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useBankAccounts } from "../../../../../app/hooks/useBankAccounts";
import { useCategories } from "../../../../../app/hooks/useCategories";
import { transactionsService } from "../../../../../app/services/transactionsService";
import { currencyStringToNumber } from "../../../../../app/utils/currencyStringToNumber";
import { useDashboard } from "../../components/DashboardContext/useDashboard";

const schema = z.object({
  value: z.string().min(1, 'Informe o valor'),
  name: z.string().min(1, 'Informe o nome'),
  categoryId: z.string().min(1, 'Informe a categoria'),
  bankAccountId: z.string().min(1, 'Informe a conta'),
  date: z.date()
})

type FormData = z.infer<typeof schema>

export function useNewTransactionModalController() {
  const {
    isNewTransactionModalOpen,
    newTransactionType,
    closeNewTransactionModal
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

  const { accounts } = useBankAccounts();
  const { categories: categoriesList } = useCategories();

  const {
    isPending,
    mutateAsync: createTransaction
  } = useMutation({
    mutationFn: transactionsService.create
  })

  const handleSubmit = hookFormSubmit(async data => {
    try {
      await createTransaction({
        value: currencyStringToNumber(data.value),
        type: newTransactionType!,
        bankAccountId: data.bankAccountId,
        categoryId: data.categoryId,
        date: data.date.toISOString(),
        name: data.name
      })

      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })

      toast.success(
        newTransactionType === 'EXPENSE'
          ? 'Despesa cadastrada com sucesso!'
          : 'Receita cadastrada com sucesso!'
      );

      closeNewTransactionModal()

      reset({
        name: '',
        bankAccountId: '',
        categoryId: '',
        date: new Date(),
        value: '0'
      })
    } catch {
      toast.error(newTransactionType === 'EXPENSE'
        ? 'Erro ao cadastrar despesa!'
        : 'Erro ao cadastrar receita!')
    }
  })

  const categories = useMemo(() => {
    return categoriesList.filter(category => category.type === newTransactionType)
  }, [categoriesList, newTransactionType])

  return {
    isNewTransactionModalOpen,
    newTransactionType,
    closeNewTransactionModal,
    register,
    handleSubmit,
    errors,
    control,
    accounts,
    categories,
    isLoading: isPending,
  }
}