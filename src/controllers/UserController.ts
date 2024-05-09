import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '@/services/prisma'

export class UserController {
  async list(req: Request, res: Response) {
    const users = await prisma.user.findMany()
    return res.status(200).json({ users });
  }

  async get(req: Request, res: Response) {
    const userId = req.params.id;
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Erro ao procurar usuario', error);
      return res.status(500).json({ error: 'Erro ao procurar o usuario' });
    }
  }

  async create(req: Request, res: Response) {
    const { email, name, login, password, img, token } = req.body;
    const userExists = await prisma.user.findUnique({ where: { email } })
    const passwordHash = await bcrypt.hash(password, 10)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const user = await prisma.user.create({
      data: {
        email,
        name,
        login,
        password: passwordHash,
        img,
        token
      }
    })
    if ((userExists) && (email.length < 5 || email.length > 100) && (!emailRegex.test(email))) {
      return res
        .status(400)
        .json({ error: 'error when creating user' })
    }

    return res.json({ user, message: 'Usuario criado com sucesso' })
  }

  async delete(req: Request, res: Response) {
    const userId = req.params.id; // Extrai o ID do parâmetro da rota
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      await prisma.user.delete({ where: { id: parseInt(userId) } });
      return res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário por ID:', error);
      return res.status(500).json({ error: 'Erro ao deletar usuário por ID' });
    }
  }

  async update(req: Request, res: Response) {
    const userId = req.params.id;
    const { email, name, login, password, img, token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        email,
        name,
        login,
        password: password ? await bcrypt.hash(password, 10) : undefined,
        img,
        token
      }
    });
    if (user) {
      return res.status(200).json({ user: updatedUser });
    } else {
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }
}